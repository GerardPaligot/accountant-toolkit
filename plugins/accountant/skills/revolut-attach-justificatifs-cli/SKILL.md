---
name: revolut-attach-justificatifs-cli
description: Accelerated version of `revolut-attach-justificatifs`. Uses the `revolut` CLI (client of the official Revolut Business API, installed globally) to do the INVENTORY and the MATCHING of the expenses to complete — without driving the browser, hence much faster and consuming far fewer tokens. The UPLOAD of the receipt itself stays driven by Playwright MCP (the official API is read-only). Trigger when the user says « complète Revolut avec les justificatifs (CLI) », « inventorie les dépenses Revolut à compléter », « liste les dépenses missing_info », « pousse les YAML vers Revolut via la CLI ».
---

# Skill — Attaching Revolut Business receipts (CLI version)

## Overview

Same goal as the twin skill [`revolut-attach-justificatifs`](../revolut-attach-justificatifs/SKILL.md): attach the PDF/JPG receipts to the Revolut Business transactions with status **"Terminée · Informations de la dépense requises"**, fill a **Remarque** and the **Catégorie**.

**The difference**: the slowest and most token-costly phase of the old skill — the **inventory** (scrolling Revolut's virtual table, reading each row, guessing the merchant/date/amount) and the YAML **matching** — is replaced by **a single deterministic CLI call** to the official Revolut Business API. The browser is no longer needed except for the upload.

### Read / write split (must absolutely understand)

| Phase | Tool | Why |
|---|---|---|
| **Inventory** of the expenses to complete | **`revolut` CLI** (official API, read) | Fast, exact, ~0 navigation token |
| **Matching** YAML ↔ expense | **You (LLM) locally** | Reading the `.yaml` + CLI JSON |
| **Verification** of an already-attached receipt | **`revolut receipts download` CLI** | Downloads the existing receipt |
| **Upload** PDF + Remarque + Catégorie + Envoyer | **Playwright MCP** | ⚠️ The Revolut Business API is **read-only**: no receipt-upload nor expense-modification endpoint. Writing only exists via the web UI. |

> **Why the upload stays in Playwright**: `business.json` (official OpenAPI) only exposes `GET` on `/expenses`, `/expenses/{id}`, `/expenses/{id}/receipts/{id}/content`. No `POST`/`PATCH`. The bank keeps piece-writing out of the public API. The CLI therefore CANNOT upload — it prepares the work, Playwright executes it.

## When to use

- The user has already run `justificatif-describe` (existing YAML per month in `receipts/YYYY-MM/`).
- The `revolut` CLI is installed globally and authenticated (`revolut auth status` → `accessTokenValid` or at least `hasRefreshToken: true`).
- You want to document the bank (URSSAF/tax audit) **without** paying the cost of the browser inventory.

**Do not use to**: internal transfers (treasury), direct debits (Alan, URSSAF, Revolut subscriptions), Revolut fees. These transactions have no receipt to attach.

## Prerequisites

1. **`revolut` CLI installed and on the PATH.** Check: `revolut --help`. (Build in `packages/revolut-cli`, exposed via `npm link` or an npm install.)
2. **CLI authenticated.** Check: `revolut auth status`. If `hasRefreshToken: false` → run `revolut auth setup` once (OAuth consent, fetches the `refresh_token`). The access token refreshes itself (40 min lifetime).
3. **Playwright MCP** configured and started, **Revolut Business tab logged in** (`business.revolut.com`) — only for the upload phase.
4. **"Dépenses" module enabled** in Revolut Business.
5. **Memory up to date** (`bootstrap-projet`) for the EURL context.

> **Lethal trifecta**: Revolut Business = sensitive banking data. The CLI calls the API via Bash (allowed). **NEVER call an internal data source MCP** (Asana/M365/Sentry/Slack) in the same session. The hook can block WebFetch and certain `browser_evaluate`. Work 100% local + CLI + Playwright.

## Workflow architecture (3 phases)

```
Phase 1 — INVENTORY (CLI)      revolut expenses list --state missing_info  → JSON worklist
Phase 2 — MATCHING (local)     you: JSON ⋈ receipts/YYYY-MM/*.yaml         → plan + blockers
Phase 3 — UPLOAD (Playwright)  for each match: open the expense, upload, Remarque, Catégorie, Envoyer
```

---

## Phase 1 — Inventory via CLI

Fetches **all** the expenses to complete over the period, in JSON (auto-paginated). The `--state missing_info` filter corresponds exactly to the UI status **"Informations de la dépense requises"**; it **automatically excludes** the already-processed expenses (once sent, they leave `missing_info`).

```bash
# One-month period (adapt the bounds)
revolut expenses list --state missing_info --from 2026-01-01 --to 2026-02-01 > /tmp/revolut_missing.json

# Compact view to reason (jq): the essentials to match
jq -r '.expenses[] | [.expense_date, .merchant, (.spent_amount.amount|tostring)+" "+.spent_amount.currency, (if (.receipt_ids|length)>0 then "reçu✓" else "reçu✗" end), (.description//"—")] | @tsv' /tmp/revolut_missing.json
```

Fields returned per expense (native Revolut JSON, snake_case, **verbatim** — the CLI reformats nothing):

| Field | Matching / upload usage |
|---|---|
| `id` | expense id (for `expenses get` / `receipts download`) |
| `transaction_id` | **Playwright deep-link** to the panel (see Phase 3) |
| `merchant` | match term + scroll-find |
| `expense_date` | match term (date ± 2 d) |
| `spent_amount` `{amount, currency}` | match term (± 0.01 € ; ⚠️ foreign currency) |
| `description` | if `null` → Remarque to enter |
| `receipt_ids` | if `[]` → receipt to upload ; otherwise already a receipt |
| `splits[].category` | if `null` → category to complete |

Detail of a specific expense: `revolut expenses get <id>`.
Verify an already-attached receipt: `revolut receipts download <id> --out /tmp/revolut_receipts`.

---

## Phase 2 — Local matching (you, without the browser)

For **each** expense of the JSON, look for the candidate YAML in `receipts/YYYY-MM/` (month = `expense_date`). Criteria:

- **date**: `document.date` within `expense_date ± 2 days`
- **amount**: `amounts.total_incl_tax` ≈ `spent_amount.amount` to **± 0.01 €**
- **merchant**: `merchant.trade_name` or `merchant.name` ≈ `merchant`

3 cases, like the old skill:

1. **Unique match** → candidate to upload.
2. **No match** → orphan → blocker (`_revolut_blockers.md`).
3. **Several candidates** → user arbitration required.

⚠️ **Foreign currency**: for USD/others, Revolut shows the **card total_incl_tax (commission/exchange included)**, which may differ from the invoice total_excl_tax/total_incl_tax (~5% gap for PayPal). Do not require strict equality; document the gap in the Remarque (cf. StartFabrik case in the old skill).

**Build the plan** (in memory or a working file). For each retained match, note what will serve Phase 3:

```
expense_id        = <id>
transaction_id    = <transaction_id>          # for deep-link
pdf               = receipts/YYYY-MM/<file.name>   # check the real extension via ls (.pdf OR .jpg)
remarque          = <nature.short_description> (+ standardized comment, see mapping)   # "Remarque" Revolut field
revolut_category  = <mapping nature.category>
match_terms       = [merchant, "DD/MM/YYYY", "XX,XX €"]   # Playwright scroll-find fallback
missing           = receipt? description? category?       # from receipt_ids/description/splits[].category
```

**Present the recap to the user and wait for explicit validation** before any write (N to enrich, N unique matches, N ambiguous, N orphans).

> Excluding the already-done ones is free: `--state missing_info` only returns what remains. The `_revolut_uploaded.md` / `_revolut_blockers.md` files remain useful for the audit and the arbitration queue, but are no longer indispensable to filter.

---

## Phase 3 — Upload via Playwright

The API cannot write → we reuse **the Playwright helpers of the [`revolut-attach-justificatifs`](../revolut-attach-justificatifs/SKILL.md) skill** (Phases A/B/C, tested selectors). Do NOT re-duplicate the selectors here (they rot when Revolut changes its DOM) — refer to the twin skill for the mechanical detail.

**Key acceleration brought by the CLI**: we already know `transaction_id`. Try to open the panel **directly** rather than scrolling the table:

```
https://business.revolut.com/transactions?viewId=<transaction_id>&viewSide=sell
```

- If the deep-link properly opens the panel of the right transaction → **no more scroll-find** (the big browser gain disappears). *(To validate: API `transaction_id` == UI `viewId`. If the equality is not verified, fall back to scroll-find by `match_terms`.)*
- Otherwise → scroll-find by `match_terms` (helper A of the twin skill), which is now **reliable** because the terms come from the API, not from an approximate read of the table.

Then, per expense (twin skill helpers):
1. Open the **"DépensesDonnées requises"** sub-form (full-screen dialog).
2. **Upload**: `browser_file_upload({ paths: ["<absolute pdf>"] })` after clicking `input[type="file"][accept*="application/pdf"]`. (~50% of cases require a double-click of the input — see twin skill.)
3. **Remarque**: "Ajouter"/"Modifier" button (top 500-800, left > 1000) → textarea → `remarque` → "Enregistrer".
4. **Catégorie** if relevant (often OK by default — do not force without reason).
5. **"Envoyer"** (top of the dialog) then **"Fermer"**.

Status after: `missing_info` → plain **"Terminée"**. ✅ (On the next `revolut expenses list --state missing_info`, the expense will have disappeared from the list — free verification that the send succeeded.)

Update `receipts/_revolut_uploaded.md` (and `receipts/_revolut_blockers.md`) as in the old skill.

---

## Mapping YAML → Revolut

| Revolut field | YAML source | Notes |
|---|---|---|
| Receipt (file) | `file.name` in `receipts/YYYY-MM/` | **Check the real extension** (`.pdf` OR `.jpg`) via `ls` before upload — `setFiles` fails (`ENOENT`) otherwise |
| Remarque | `nature.short_description` (+ `merchant.trade_name` if illuminating, + standardized comment) | ~50 characters |
| Catégorie | mapping `nature.category` → Revolut category | often OK by default |

### Standardized comments (consistency with Tiime)

Taken from the twin skill — reuse as-is:

| Piece category | Revolut comment |
|---|---|
| Courses Otera Sunday | `Courses Otera dimanche — position contribuable AN nourriture (cabinet).` |
| Courses Picard / Otera lunch | `Courses Picard — position contribuable AN nourriture (cabinet).` |
| Client meal (PlanetSushi/Breton/Charivari) | `Repas client — compte 625710 visé (à recat cabinet).` |
| Café Match office | `Café MEO grains 100 % bureau — consommable (compte 606300).` |
| Honoraires L-Expert | `Honoraires mensuels expertise accountant.` |
| Apple/UGREEN hardware | `[Description objet] — matériel info.` |
| EasyPark | `Stationnement déplacement pro.` |

(Full list in the twin skill.)

---

## CLI cheat-sheet

```bash
revolut auth status                                  # token valid ?
revolut auth setup                                   # OAuth consent (once)

revolut expenses list --state missing_info --from <iso> --to <iso>   # inventory (auto-paginated)
revolut expenses list --state missing_info --from <iso> --to <iso> --type card_payment
revolut expenses get <expense_id>                    # full detail of an expense
revolut receipts download <expense_id> --out <dir>   # download the existing receipt(s)

revolut transactions list --from <iso> --to <iso>    # raw transactions (correlation)
revolut categories list                              # accounting categories (mapping ref.)
revolut tax-rates list                               # VAT rates (ref.)

# global options : --pretty (readable table)  |  --sandbox (test env)
```

`list` output = `{ "expenses": [...] }`, native Revolut JSON (snake_case). Errors → stderr + exit code ≠ 0.

---

## Mandatory stop rules

**Stop and note in `_revolut_blockers.md`** if:

- No candidate YAML for a non-recurring debit expense (orphan).
- Several candidate YAML with an amount gap > 0.01 € → user arbitration.
- Expense = direct debit (Alan, URSSAF…) with no expected receipt → out of scope.
- `revolut auth status` indicates an invalid token and `auth setup` fails.
- `revolut expenses list` returns an error (stderr) — do NOT guess, report the message.
- The Playwright upload fails or Revolut shows a network error.

**NEVER** attach a PDF to an expense without an exact YAML match (date + amount + merchant).

---

## Anti-patterns

- ❌ **Believing the CLI can upload / modify an expense.** It is **read-only**. The upload is Playwright.
- ❌ **Redoing the inventory in the browser** when `revolut expenses list` does it in one call. That is the whole point of this skill.
- ❌ **Parsing the JSON by hand** when `jq` is enough (compact view above).
- ❌ **Assuming `.pdf` for all receipts** — the folder mixes `.pdf` and `.jpg`. `ls` before upload.
- ❌ **Requiring strict amount equality for foreign currency** — Revolut card total_incl_tax ≠ invoice total_excl_tax. Document the gap.
- ❌ **Calling an internal data source MCP (Asana/M365/…) in the session** — lethal-trifecta, blocks the rest.
- ❌ **Launching Phase 3 without user validation** of the Phase 2 plan.
- ❌ **Forcing the Revolut auto-detected category** without reason — it's for their analytics, not the accounting.

---

## See also

- [`revolut-attach-justificatifs`](../revolut-attach-justificatifs/SKILL.md) — twin skill; **source of the Playwright helpers** (Phase 3) and of the DOM selectors.
- `justificatif-describe` — upstream skill, produces the YAML.
- `tiime-upload-justificatifs` — twin skill on the Tiime side.
- `bootstrap-projet` — EURL context loading.
- `revolut` CLI: `packages/revolut-cli/README.md` — install, auth, regeneration of the client.
- CLI spec & implementation plan: `docs/superpowers/` (design + plan).
