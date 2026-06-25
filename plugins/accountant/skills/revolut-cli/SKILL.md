---
name: revolut-cli
description: How to use the `revolut` CLI — a read-only client of the official Revolut Business API. Use it to inventory expenses (notably those needing a receipt/description), read transactions, download existing receipts, and list accounts/categories/tax-rates, all as clean JSON, without driving a browser. Trigger when the user wants to "list Revolut expenses", "check what's missing_info on Revolut", "download a Revolut receipt", "inventory Revolut transactions", or any read of Revolut Business data from the terminal.
---

# Skill — Using the `revolut` CLI

## What it is

`revolut` is a thin, deterministic command-line client of the **official Revolut
Business API** (`https://b2b.revolut.com/api/1.0`). It prints the API's native
JSON to stdout. It does **no** matching, interpretation, uploading or editing —
it only reads. Use it for the fast, cheap, token-light read/inventory work;
leave any judgement (matching a YAML to an expense, etc.) to yourself.

> **Read-only.** The Revolut Business API has no receipt-upload or
> expense-mutation endpoint. To attach a receipt or set a description you still
> need the browser (see the `revolut-attach-justificatifs-cli` skill, which uses
> this CLI for inventory and Playwright for the upload).

## Prerequisites

1. `revolut` on the PATH. Check `revolut --help`. (Built from
   `packages/revolut-cli`; `npm install && npm run build`, then `npm link` or an
   npm install exposes the `revolut` bin.)
2. Authenticated. Check `revolut auth status`. If `hasRefreshToken: false`, run
   `revolut auth setup` once (one-time OAuth consent → stores a `refresh_token`).
   The access token (40-min lifetime) refreshes itself afterwards.

## Command reference

```bash
revolut auth setup                          # one-time OAuth consent → store refresh_token
revolut auth status                         # report token validity (no secrets printed)

revolut expenses list --from <iso> --to <iso> [--state <state>] [--type <type>]
revolut expenses get <id>                   # full detail of one expense

revolut transactions list --from <iso> --to <iso> [--type <type>] [--account <id>]
revolut transactions get <id>

revolut receipts download <expenseId> --out <dir> [--receipt <id>]

revolut accounts list
revolut categories list                     # accounting categories (mapping reference)
revolut tax-rates list                      # VAT rates (reference)
```

Global flags (before the subcommand): `--sandbox` targets the sandbox host;
`--pretty` renders a human table instead of JSON.

- `--from` / `--to` take ISO dates or date-times (`2026-01-01`). `list` commands
  **auto-paginate** the whole window (no cursor handling needed).
- `expenses list --state` enum: `missing_info` (= UI "Information required"),
  `awaiting_review`, `reverted`, `pending_reimbursement`, `refund_requested`,
  `refunded`, `approved`, `rejected`.
- `--type` enum (expenses & transactions): `atm`, `card_payment`, `fee`,
  `transfer`, `external`, `mileage_reimbursement`.

## Output

`list` commands print `{ "<resource>": [ … ] }` — the API's native JSON,
snake_case, verbatim. `get` prints the single object. Errors go to **stderr**
with a non-zero exit code (no partial JSON on stdout). Pipe to `jq` to shape it.

## Examples

```bash
# Expenses still needing info for January 2026 (the receipt-attach target set)
revolut expenses list --state missing_info --from 2026-01-01 --to 2026-02-01

# Compact triage view: date, merchant, amount, has-receipt, description
revolut expenses list --state missing_info --from 2026-01-01 --to 2026-02-01 \
  | jq -r '.expenses[] | [.expense_date, .merchant,
      (.spent_amount.amount|tostring)+" "+.spent_amount.currency,
      (if (.receipt_ids|length)>0 then "receipt" else "NO-receipt" end),
      (.description // "—")] | @tsv'

# Full detail of one expense (merchant, splits, category, tax_rate, receipt_ids…)
revolut expenses get 8f3c1e2a-1b4d-4c9a-9f21-7a6b5c4d3e2f

# Download the receipt(s) already attached to an expense
revolut receipts download 8f3c1e2a-… --out /tmp/revolut-receipts

# Category / tax-rate references (to map a fiche's category to Revolut's)
revolut categories list
revolut tax-rates list

# Sandbox + table output
revolut --sandbox --pretty transactions list --from 2026-01-01 --to 2026-02-01
```

## Per-expense fields worth knowing (from `expenses list` / `get`)

| Field | Meaning |
|---|---|
| `id` | expense id (feed to `expenses get` / `receipts download`) |
| `transaction_id` | the underlying transaction (browser deep-link key) |
| `merchant`, `expense_date`, `spent_amount {amount,currency}` | matching terms |
| `description` | `null` → no remark yet |
| `receipt_ids` | `[]` → no receipt attached yet |
| `splits[].category`, `splits[].tax_rate` | `null` → not categorized |

## Gotchas

- ❌ **Don't expect it to upload/edit** — read-only API. Writing is browser-only.
- ❌ **Don't require strict amount equality in foreign currency** — Revolut shows
  the card amount (commission/FX included), which can differ from an invoice's
  EUR figure. Compare loosely; document the gap downstream.
- ❌ **Don't re-list to "find what's done"** — once a receipt+description are sent
  in the UI, the expense leaves `missing_info`, so `--state missing_info` already
  excludes finished ones for free.
- If a command errors, read **stderr** — don't guess. Auth errors point to
  `revolut auth setup`.

## See also

- `revolut-attach-justificatifs-cli` — uses this CLI for inventory, Playwright for upload.
- `packages/revolut-cli/README.md` — install, auth, client regeneration.
- `accountant-cli` — the local YAML validator (different tool, different job).
