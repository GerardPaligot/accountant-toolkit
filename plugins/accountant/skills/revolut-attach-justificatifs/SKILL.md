---
name: revolut-attach-justificatifs
description: Use this skill to attach PDF/JPG justificatives to Revolut Business transactions via Chromium piloted by Playwright MCP. Walks each transaction in the period, finds the matching YAML in `$WORKSPACE/receipts/YYYY-MM/`, uploads the PDF, fills the "Remarque" with a short description, and updates the "Catégorie" when relevant. Tracks done pieces in `_revolut_uploaded.md` and blockers in `_revolut_blockers.md`. Trigger when the user says « complète Revolut avec les justificatifs », « attache les PDF dans Revolut », « pousse les YAML vers Revolut ».
---

# Skill — Attaching receipts to Revolut Business transactions

## Overview

Drives the Revolut Business web interface (`business.revolut.com`) via Playwright MCP to attach the PDF/JPG receipts to the bank transactions. Complementary to the `tiime-upload-justificatifs` skill: Tiime handles the accounting, Revolut handles the bank-side proofs at the bank. The skill enriches the transactions with status **"Terminée · Informations de la dépense requises"** with:
- the **receipt PDF** (from the `receipts/YYYY-MM/` folder)
- a short **Remarque** (nature of the expense)
- the most appropriate **Catégorie** (if the auto-detection is imprecise)

## When to use

- The user has already run `justificatif-describe` (existing YAML per month)
- The Revolut transactions still show "Informations de la dépense requises"
- The user wants to document the bank for internal use or URSSAF/tax audit

**Do not use to**: internal transfers (treasury), direct debits (Alan, URSSAF, Revolut subscriptions), Revolut fees. These transactions have no receipt to attach.

## Prerequisites

1. **Playwright MCP** configured and started.
2. **Revolut Business tab** open (`business.revolut.com`) and **logged in** (active session) in the driven Chromium.
3. **"Dépenses" module enabled** in Revolut Business (otherwise the "Set up Expenses" button appears instead of the normal flow). To configure once on the manual UI side.
4. **Memory up to date** (`bootstrap-projet`) for the EURL context.

> **Lethal trifecta**: Revolut Business = sensitive banking data. The hook can block WebFetch and certain `browser_evaluate` that look like data leaks. **NEVER call an internal data source MCP** (Asana/M365/Sentry/Slack) in the same session. Work 100% local + Playwright.
>
> The hook can also block by asking the user for explicit authorization the first time you automate modifying actions on Revolut — accept this friction and ask the user for confirmation if needed.

## Revolut Business navigation — stable landmarks

- **Transactions list URL**: `https://business.revolut.com/transactions`
- **Detail panel**: `aside.PageSide__Container-rui__sc-10nkgiu-0` (appears on the right when a row is clicked)
- **Open-panel URL**: `?viewId={uuid}&viewSide=sell`
- **Observed transaction statuses**:
  - `Terminée` → nothing to do
  - `Terminée · Informations de la dépense requises` ← **target of the skill**
  - `Terminée · Prélèvement automatique` → do not touch (Alan, URSSAF, Revolut Business subscription, etc.)

### Table columns

`Transaction / Date / Créé par / Statut / Compte / Montant`

Row selector: `tr` or `[role="row"]` (to confirm depending on the version). Row text contains: merchant name + date + created by + status + account + amount.

## General procedure

### Step 1 — Bootstrap & inventory

1. Run `bootstrap-projet` if the session is new.
2. Read the `receipts/_revolut_uploaded.md` file to exclude the already-processed transactions.
3. Navigate to `/transactions` and walk the history (paginate if needed).
4. **Inventory**:
   - All transactions with status `Informations de la dépense requises`
   - For each, identify the candidate YAML in `receipts/YYYY-MM/` by matching `date ± 2 days + amount ± 0.01 € + merchant`
   - 3 cases: unique match / no match / several candidates

### Step 2 — User validation

Present the recap to the user:
- N transactions to enrich
- N transactions with a unique YAML match (easy)
- N ambiguous transactions (several candidate YAML — require arbitration)
- N transactions without YAML (orphans — note in blockers)

**Wait for explicit validation** before engaging any modifications.

### Step 3 — Per-transaction enrichment flow (reworked 2026-05-14 session 2)

**⚠️ Revolut changed its Dépenses UI between session 1 and session 2 (April → May 2026).** The sub-form in the panel became a **full-screen dialog** that REPLACES the detail panel. The workflow below is validated on the new UI.

**The workflow runs in 3-4 phases over 3-4 tool calls**:

#### Phase A — Scroll-find + open the file chooser (1 eval)

1. **FIRST: Press Home** via `browser_press_key('Home')` BEFORE each scroll-find. `window.scrollBy(0, X)` does NOT work in Revolut — the scroll is on `document.documentElement` and can get stuck at the bottom. Home resets it.
2. **Scroll-find the row** by textContent (merchant + date + amount). The Revolut virtual scroll unloads rows out of the viewport — you have to scroll SLOWLY to catch the transactions as they pass:
```js
const scroller = document.scrollingElement || document.documentElement;
let row = null;
for (let i = 0; i < 50; i++) {
  for (const r of document.querySelectorAll('[role="row"], tr')) {
    if (matchTerms.every(m => r.textContent.includes(m))) { row = r; break; }
  }
  if (row) { row.scrollIntoView({ block: 'center' }); break; }
  scroller.scrollTo({ top: scroller.scrollTop + 300, behavior: 'instant' });
  await new Promise(r => setTimeout(r, 500));  // important: 500ms+ to let the virtual scroll re-render
}
row.click();  // opens right panel
await new Promise(r => setTimeout(r, 1500));
```
3. **Click "DépensesDonnées requises"** (concatenated text, no space) — opens a new **full-screen dialog** that replaces the right panel. This dialog contains sections: Reçus, Description, Catégorie accountant, Taux de TVA.
4. **Click DIRECTLY on `input[type="file"][accept*="application/pdf"]`** — the new UI has a hidden (1×1 px) file input that must be clicked programmatically. The visible "Charger" button can be misleading — prefer the input. **DO NOT** look for "Charger" like in the old UI.

#### Phase B — Upload via Playwright (1-2 tool calls)

```
browser_file_upload({ paths: ["/absolute/path/...pdf-or-jpg"] })
```

⚠️ **The file chooser sometimes closes too early**. If `browser_file_upload` fails with "can only be used when there is related modal state present", re-run a light eval:
```js
document.querySelectorAll('input[type="file"][accept*="application/pdf"]')[0].click();
```
then call `browser_file_upload` again. This double-click pattern is frequent (~50% of transactions).

⚠️ **File extension mandatory**: `setFiles` fails with `ENOENT` if the extension is not exact. Check via `ls receipts/YYYY-MM/` beforehand.

#### Phase C — Description + Envoyer (1 eval)

After upload, the full-screen dialog stays open. The UI varies depending on whether the OCR auto-filled or not:

- **If Revolut auto-filled the description** (Picard/Otera/etc. case with clear receipt OCR): **"Modifier"** button next to "Description" (top:521 left:1057 typical).
- **If Description empty**: **"Ajouter"** button next to "Description" (top:521 left:1084 typical).
- **If transaction with warning "Le reçu ne correspond pas au montant"** (StartFabrik case with a Revolut/YAML discrepancy): the panel is TALLER, the Description Ajouter button can be at top:597.

**Unified selector**: `text === 'Ajouter' || 'Modifier'`, **top between 500 and 800**, **left > 1000**.

```js
let descBtn = null;
for (const b of document.querySelectorAll('button')) {
  if (!b.offsetParent) continue;
  const t = b.textContent.trim();
  if (t !== 'Ajouter' && t !== 'Modifier') continue;
  const r = b.getBoundingClientRect();
  if (r.top > 500 && r.top < 800 && r.left > 1000) { descBtn = b; break; }
}
```

Rest of the flow:
1. **Click the found button** → opens a centered **Description modal** (top:174, left:400, w:400) with a `<textarea>`.
2. **Set textarea value** via native setter + dispatch `input` + `change` events. If auto-filled, this replaces the OCR value (consistent with the "abandon batch cooking labels" strategy).
3. **Click "Enregistrer"** in the Description modal (`left < 800` to target the modal and not another Enregistrer).
4. **Click "Envoyer"** at the top of the full-screen dialog (`top < 260, left > 700`).
5. **Click "Fermer"** (top < 120) — returns to the list.

Status after: "Terminée · Informations de la dépense requises" → plain **"Terminée"**. ✅

### Step 4 — Special cases and stop rules
8. **Update** `receipts/_revolut_uploaded.md` (and `receipts/_revolut_blockers.md` if blocked).

### Step 4 — Mandatory stop rules

**Stop and note in blockers** if:
- No candidate YAML found for a non-recurring debit transaction
- Several candidate YAML with an amount difference > 0.01 € → user arbitration
- The transaction is a direct debit (Alan, URSSAF, etc.) with no expected receipt
- The Revolut Dépenses module is not enabled ("Set up Expenses" button visible)
- The Playwright upload fails or Revolut shows a network error
- The Revolut session expires

**NEVER** attach a PDF to a transaction without an exact YAML match.

## Stable Playwright selectors (tested 2026-05)

| Action | Selector |
|---|---|
| Transactions list | `tr` or `[role="row"]` with textContent containing date + amount |
| Click a row | search by textContent (date + merchant + amount) |
| Detail panel | `aside.PageSide__Container-rui__sc-10nkgiu-0` |
| Close-panel button | `button` with exact text `"Fermer"` (at the top of the panel) |
| Plus button (actions menu) | `button` with exact text `"Plus"` |
| Open expenses sub-form button | `button` with concatenated text `"DépensesDonnées requises"` |
| Receipt file input | `input[type="file"][accept="image/jpeg,image/png,application/pdf"]` (appears after clicking Dépenses) |
| Remarque zone | textarea or input near the "Remarque" label |
| Catégorie button | button with the current category's text (e.g. "Appareils de paiement") |

⚠️ Revolut's CSS classes are generated `styled-components` (suffixes `-rui__sc-XXXX-0`). **Prefer matching by textContent** or by semantic attribute (`accept`, `aria-label`).

## Mapping YAML → Revolut fields

| Revolut field | YAML source | Notes |
|---|---|---|
| Receipt (file) | PDF/JPG from the `receipts/YYYY-MM/` folder (same base name as the YAML) | Upload via setInputFiles |
| Remarque | `nature.short_description` + `merchant.trade_name` if illuminating | ~50 characters max |
| Catégorie | mapping `nature.category` → Revolut category (to complete as cases arise) | Often OK by default |

### Revolut category mapping (to be enriched)

To be completed as exploration goes. Observed Revolut categories:
- "Appareils de paiement" (e.g. Ubiquiti)
- (to complete)

## Tracking files

The skill writes and reads **two files at the root of `receipts/`**. Their structure is also documented in `_meta_docs.yaml` at the workspace root (ids `revolut_uploaded` and `revolut_blockers`).

### `receipts/_revolut_uploaded.md`

Exhaustive journal of the enriched transactions. **Read at the start of the session** to exclude the already-done ones.

Structure:

```markdown
# Suivi attachements Revolut Business — session YYYY-MM-DD

Transactions Revolut Business dont le justificatif PDF/JPG a été attaché + description complétée + envoi (Envoyer). Statut passé de "Terminée · Informations de la dépense requises" à **"Terminée"** simple.

Format : `- [YYYY-MM-DD] Marchand TTC — yaml_attaché — description`

## YYYY-MM (N transactions[, session ...])

- [YYYY-MM-DD] Marchand X,YZ € — nom_du_yaml — Description courte

## Total session

**N transactions enrichies dans Revolut Business.**
```

To update **after each validated transaction** (or by month batches to limit the chain of writes).

### `receipts/_revolut_blockers.md`

Unprocessed cases: no matching YAML, ambiguous, out of scope, open Gérard decisions.

Typical sections (suggested order):

- `## ✅ Bilan complet` — global counter at the top
- `## 🛑 Décision ouverte Gérard` — non-accounting pieces / forcing required
- `## 🟡 À signaler au cabinet` — accounting discrepancies (e.g. PayPal commission, USD/EUR exchange)
- `## 🔴 Transactions sans YAML correspondant` — to be provided later by Gérard
- `## ℹ️ Hors périmètre du skill` — direct debits, transfers, documented duplicates
- `## ✅ Transactions déjà enrichies manuellement` — plain "Terminée" status with no skill action
- `## Doublons documentés (audit)` — for consistency with _tiime_blockers.md

For sessions in progress, also add `## ⏭️ Queue exhaustive pour session future` in copy-paste format: `[transaction] → [YAML path] → [comment]`.

### Regeneration from scratch

See `_meta_docs.yaml` → `revolut_uploaded.regeneration` / `revolut_blockers.regeneration`. In short: impossible to recreate the session chronology, but the current state of the Revolut transactions (status + attached receipts) is enough to reconstruct a functional `_revolut_uploaded.md` via a full audit.

## Special cases

### Transaction with no expected receipt (direct debits)

Do not try to attach. These transactions have the `Prélèvement automatique` status and are implicitly justified (Alan = health insurance, URSSAF = TNS contributions, Revolut Business subscription).

To document in the comment for the accountant: these lines will never have a PDF but are deductible by nature documented by contract.

### Transaction without YAML (orphan)

If a debit transaction has no candidate YAML (e.g. Sushi Vda 41,30 € refund visible in the list — no PDF in `receipts/`), it's a signal:
1. Either the receipt has not yet been photographed / deposited by Gérard
2. Or the transaction is a refund to be adjusted
3. Or it's a personal expense on the EURL card (to report as a benefit in kind or CCA rebilling)

→ Note in blockers for Gérard's decision.

### Several candidate YAML (identical amount)

Observed case: Picard 23,25 € on 24/12/2025 — 2 YAML with the same amount on the same day (documented duplicate). Ask Gérard which YAML to attach to the Revolut transaction (probably only one, the other being to delete on the YAML/Tiime side).

## Reusable patterns (tested 2026-05-14)

### Helper A — Open and trigger file chooser (eval 1)

```js
async function openTransactionAndChargeFileChooser(rowMatchTerms) {
  // 1. Scroll-find row (Revolut virtual scroll)
  let row = null;
  for (let i = 0; i < 30; i++) {
    for (const r of document.querySelectorAll('[role="row"], tr')) {
      const t = r.textContent;
      if (rowMatchTerms.every(m => t.includes(m))) { row = r; break; }
    }
    if (row) { row.scrollIntoView({ block: 'center' }); break; }
    window.scrollBy(0, 350);
    await new Promise(r => setTimeout(r, 350));
  }
  if (!row) return 'row not found';
  await new Promise(r => setTimeout(r, 500));
  row.click();
  await new Promise(r => setTimeout(r, 1500));
  // 2. Click DépensesDonnées requises
  for (const b of document.querySelectorAll('button')) {
    const t = b.textContent.trim();
    if (t.startsWith('Dépenses') && t.includes('requises')) { b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  // 3. Click Charger to trigger file chooser modal
  for (const b of document.querySelectorAll('button')) {
    if (b.textContent.trim() === 'Charger') {
      const r = b.getBoundingClientRect();
      if (r.top > 350 && r.left > 1000) { b.click(); break; }
    }
  }
  await new Promise(r => setTimeout(r, 800));
  return 'file chooser ready';
}
```

### Tool call B — Upload via Playwright MCP

```js
// Tool: browser_file_upload
{ paths: ["$WORKSPACE/receipts/YYYY-MM/nom.pdf-or-jpg"] }
```

### Helper C — Description + Envoyer + Fermer (eval 3)

```js
async function fillDescriptionAndSubmit(description) {
  // 1. Re-open Dépenses sub-form
  for (const b of document.querySelectorAll('button')) {
    const t = b.textContent.trim();
    if (t.startsWith('Dépenses') && t.includes('requises')) { b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  // 2. Click "Ajouter" next to Description
  const allBtns = Array.from(document.querySelectorAll('button')).filter(b => b.getBoundingClientRect().left > 700);
  for (const b of allBtns) {
    if (b.textContent.trim() === 'Ajouter') {
      let p = b.parentElement;
      while (p) {
        if (p.textContent.includes('Description')) { b.click(); break; }
        p = p.parentElement;
      }
      if (document.querySelector('textarea')) break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  // 3. Fill textarea via native setter + dispatch events
  const ta = document.querySelector('textarea');
  if (ta) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
    setter.call(ta, description);
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    ta.dispatchEvent(new Event('change', { bubbles: true }));
  }
  await new Promise(r => setTimeout(r, 500));
  // 4. Click "Enregistrer" (Description modal)
  for (const b of document.querySelectorAll('button')) {
    if (b.textContent.trim() === 'Enregistrer') { b.click(); break; }
  }
  await new Promise(r => setTimeout(r, 1500));
  // 5. Click "Envoyer" (panel top)
  for (const b of document.querySelectorAll('button')) {
    if (b.textContent.trim() === 'Envoyer') {
      const r = b.getBoundingClientRect();
      if (r.width > 0 && r.top < 250) { b.click(); break; }
    }
  }
  await new Promise(r => setTimeout(r, 2000));
  // 6. Close panel
  for (const b of document.querySelectorAll('button')) {
    if (b.textContent.trim() === 'Fermer') {
      const r = b.getBoundingClientRect();
      if (r.width > 0) { b.click(); break; }
    }
  }
  return 'done';
}
```

### Observed performance

- ~25 seconds per transaction (3 tool calls: open eval, file upload, end eval)
- File chooser open in ~800ms after clicking Charger
- Tiime runs the OCR quickly after sending (<1s on the list side)

⚠️ The upload **requires Playwright orchestration** (`browser_file_upload`), not just JS in `browser_evaluate`. The pattern is: trigger the file chooser via a JS click, then call `browser_file_upload` at the tool level, then continue in eval.

## Anti-patterns

- ❌ **Using `window.scrollBy(0, X)` or `window.scrollTo(0, 0)`** — does not work in Revolut. Use `browser_press_key('Home')` + `document.scrollingElement.scrollTo({top: scrollTop+300})`.
- ❌ **Looking for the "Charger" button like in the old UI** — the new UI has a hidden 1×1 px file input that must be clicked directly via `input[type="file"][accept*="application/pdf"]`.
- ❌ **Clicking "Ajouter" without a position constraint** — there are several "Ajouter" in the dialog (Description, Catégorie accountant, Taux de TVA). Use the position: top between 500 and 800, left > 1000. Without this precision, you open the wrong modal (typically "Catégories accountants") and the rest fails.
- ❌ **Clicking a modifying button without explicit authorization** for the Revolut batch — the hook can block and that is legitimate.
- ❌ **Attaching a PDF to a transaction without checking the exact match** (date + amount + merchant). Better to note in a blocker.
- ❌ **Assuming queue amount = Revolut amount** — for foreign-currency transactions (USD, others), Revolut shows the card total_incl_tax with commission/exchange included, which may differ from the invoice total_excl_tax (~5% gap for PayPal). Observed case: StartFabrik 458,28 € invoice total_excl_tax vs 484,45 € Revolut card total_incl_tax. Document the gap in the description.
- ❌ **Modifying the Revolut auto-detected category** without good reason — it's for their analytics, not for the accounting.
- ❌ **Trying WebFetch after Revolut access** — blocked by lethal-trifecta.
- ❌ **Assuming `.pdf` is the extension of all YAML** — the folder mixes `.pdf` (invoices) and `.jpg` (receipt photos). Check `ls` beforehand.
- ❌ **Forcing the upload of a piece documented as "DO NOT upload"** — the lethal-trifecta hook blocks it (rightly).
- ❌ **Relying on a single `browser_file_upload` call** — ~50% of cases require a re-click of the input then a second `browser_file_upload`. The modal file chooser sometimes closes prematurely after the Phase A eval.
- ❌ **Clicking "Envoyer" without having first saved the Description** — the Enregistrer button of the Description modal must be clicked before the Envoyer of the main dialog.

## Resuming an interrupted session

Final state 2026-05-14 (cf. `receipts/_revolut_uploaded.md` and `receipts/_revolut_blockers.md`):
- **35 transactions enriched in total** (12 session 1 + 23 session 2 of 2026-05-14)
- **2 complete sessions**: the exhaustive queue of 24 transactions is processed
- **Residual blockers**: 13 transactions without YAML + 1 Sushi Vda 16/04 decision

To resume:

1. Load `bootstrap-projet` for the EURL context.
2. Read `receipts/_revolut_uploaded.md` for the already-done ones.
3. Read `receipts/_revolut_blockers.md` for the work queue + the ambiguities to arbitrate with the user.
4. Open the Revolut Business tab (`browser_tabs(action: list)`) — check the active session.
5. Navigate to `/transactions?sort=metadata.date:desc` and scroll-find each remaining transaction.

### Arbitrated decisions to apply in a future session

- **Sushi Vda 16/04 + 27/04 47,40 €**: **DO NOT attach** (hook blocked). The `mobile_20260426` receipt is "Document non accountant" — either Gérard provides the real PlanetSushi invoice, or we skip it definitively.
- **MYCS 21/12/2025 1 439,67 €**: **attach** `mycs_20260307_FV090937.pdf` (Gérard decision confirmed).
- **Sushi Vda client meals** (Planet Sushi 16/03 + 24/03): attach with comment `"Repas client — compte 625710 visé (à recat cabinet)."` (Tiime already uses the RECEPTIONS FRAIS DE REPRESENTATION label).
- **Picard / Otera / Plaisirs courses**: attach with the standardized comment `"Courses [marchand] — position contribuable AN nourriture (cabinet)."` (consistent with Tiime).
- **Picard 20/01 73,61 € duplicate**: use `restaurant_20260120_90038279.pdf` rather than `picard_20260122_90038215` (date more consistent with the Revolut transaction 20/01).
- **Stad Gent 24/02 9,38 €**: SKIP (Ghent city ≠ Molenbeek of the YAML). Ask Gérard to provide the right receipt.

### Transactions to process (queue ordered chrono asc)

Exhaustive list with YAML mapping, comment and paths in `receipts/_revolut_blockers.md` section "À traiter dans une prochaine session".

## Standardized comments (consistency with Tiime)

| Piece category | Revolut comment |
|---|---|
| Courses Otera Sunday | `Courses Otera dimanche — position contribuable AN nourriture (cabinet).` |
| Courses Picard / Otera lunch | `Courses Picard — position contribuable AN nourriture (cabinet).` |
| Plaisirs et Gourmandises lunch | `Repas indiv. midi — position contribuable AN nourriture (cabinet).` |
| Client meal (PlanetSushi/Breton/Charivari) | `Repas client — compte 625710 visé (à recat cabinet).` |
| Café Match office | `Café MEO grains 100 % bureau — consommable (compte 606300).` |
| Honoraires L-Expert | `Honoraires mensuels expertise accountant.` |
| Apple/UGREEN hardware | `[Description objet] — matériel info.` |
| EasyPark | `Stationnement déplacement pro.` |
| DDG trip (Mozza CDG, SSP Iceland) | `[Type repas] CDG [direction] voyage DDG Reykjavik.` |
| Ibis hotel | `Taxes séjour [dates] — [conférence/motif].` |

## Skill maintenance

To update when:
- Revolut changes its DOM (broken selectors)
- New Revolut Dépenses workflow (split, multi-receipt, etc.)
- New Revolut category encountered

## See also

- `justificatif-describe` (upstream skill — produces the YAML)
- `tiime-upload-justificatifs` (twin skill on the Tiime side)
- `bootstrap-projet` (context loading)
- Memory `audit_decisions_2026-05.md`
