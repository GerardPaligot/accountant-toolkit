# Revolut Business CLI — Design Spec

- **Date:** 2026-06-18
- **Status:** Approved (design)
- **Author:** Gérard Paligot (with Claude)
- **Repo context:** `revolut-openapi` — official Revolut OpenAPI specifications (this repo). The CLI consumes `json/business.json`.

## 1. Purpose

Build `revolut-business-cli`: a thin, standalone, deterministic command-line tool over the **official Revolut Business API** (`https://b2b.revolut.com/api/1.0`). It fetches expense, transaction, receipt, and reference data and prints clean JSON to stdout.

It exists to **accelerate and cheapen** the existing browser-automation skill
`revolut-attach-justificatifs` (Playwright/Chromium piloting `business.revolut.com`).
That skill's slowest, most token-expensive phase is *inventory*: scroll-finding every
row in a virtual-scroll table and eyeballing merchant/date/amount to know which
transactions still need a receipt or a description. The CLI replaces that phase with a
single deterministic API call.

### Non-goals

- **The CLI does no matching, no reasoning, no interpretation.** It does not resolve
  local YAML/PDF justificatives, does not decide what is "missing", does not classify
  blockers. All of that judgment stays with the LLM/skill that consumes the CLI output.
- **The CLI does not upload receipts or edit expenses.** See §2 — the official API has no
  such endpoint. The Playwright skill keeps ownership of the upload mechanics.

## 2. Key constraint — the official API is read-only for expenses

Probing `json/business.json` (Business API v1.0):

- `grep` for `multipart`, `upload` → **0 matches**.
- `/expenses` exposes **GET only**. `/expenses/{id}` GET only. `/expenses/{id}/receipts/{rid}/content` GET only.
- There is **no** POST receipt-upload and **no** PATCH to set an expense's description or category.

This is *why* the existing skill drives a real browser: receipt upload simply is not in
the public API. The CLI therefore covers the **read half** of the workflow (inventory +
data retrieval) and hands a precise, machine-readable worklist to the consumer; the
**write half** (upload, set description, set category, submit) remains the skill's job
via the web UI.

## 3. Relevant API surface (from `json/business.json`)

| Endpoint | Verb | Scope | Use |
|---|---|---|---|
| `/expenses?state=&from=&to=&count=&type=&account=` | GET | READ | List expenses; filter `state=missing_info` for the skill's target set |
| `/expenses/{expense_id}` | GET | READ | Full expense detail |
| `/expenses/{expense_id}/receipts/{receipt_id}/content` | GET | READ | Download an existing receipt's bytes |
| `/transactions?from=&to=&account=&type=&count=` | GET | READ | List transactions |
| `/transaction/{id}` | GET | READ | Transaction detail |
| `/accounting-categories` | GET | READ | Category reference (mapping aid) |
| `/tax-rates` | GET | READ | VAT-rate reference |
| `/accounts` | GET | READ | Account list (resolve `account` ids) |

### Expense schema fields the CLI passes through

`id`, `transaction_id`, `state`, `transaction_type`, `merchant`, `payer`,
`expense_date`, `spent_amount {amount, currency}`, `description`, `receipt_ids[]`,
`splits[] { amount, category {id,name,code}, tax_rate {id,name,percentage} }`,
`labels`, `submitted_at`, `completed_at`.

### Enums

- `state`: `missing_info`, `awaiting_review`, `reverted`, `pending_reimbursement`,
  `refund_requested`, `refunded`, `approved`, `rejected`.
  `missing_info` corresponds to the web UI's *"Informations de la dépense requises"*.
- `transaction_type`: `atm`, `card_payment`, `fee`, `transfer`, `external`,
  `mileage_reimbursement`.

### Pagination

`/expenses` and `/transactions` paginate by **time window** (`count` default 100, no
cursor token). To page, the client repeats the call with `to` set to the oldest
returned item's timestamp. The CLI auto-paginates and concatenates pages transparently.

## 4. Authentication

From the spec's `AccessToken` security scheme:

- HTTP **Bearer** access token. All endpoints used here require scope **`READ`**.
- Access token expires after **40 minutes**; a `refresh_token` mints new ones.
- Obtaining the first token requires a **client-assertion JWT** signed (RS256) with the
  private key of an API certificate enrolled in the Revolut Business dev portal, plus a
  **one-time OAuth consent** (authorize → authorization code → exchange for
  `access_token` + `refresh_token`).
- The token endpoint (`/auth/token`) lives on a **separate auth host and is not part of
  this OpenAPI spec**. The CLI therefore hand-rolls the token exchange/refresh; the
  generated client only covers the resource endpoints.

### CLI auth handling

- Config sources (in precedence order): env vars `REVOLUT_CLIENT_ID`,
  `REVOLUT_PRIVATE_KEY` (path), `REVOLUT_REFRESH_TOKEN` → then
  `~/.config/revolut-cli/config.json`.
- `getAccessToken()`: reuse cached token from `~/.config/revolut-cli/token.json` if it
  is valid (>1 min before the 40-min expiry); otherwise sign a fresh client-assertion
  JWT (`jsonwebtoken`, RS256), POST `grant_type=refresh_token` to `/auth/token`, cache
  the new access token + expiry.
- `revolut auth setup`: one-time interactive flow — print the authorize URL, accept the
  redirect `code`, exchange it for the `refresh_token`, and store config. Honors
  `--sandbox`.
- Secrets are never logged. `token.json`/`config.json` are written `chmod 600`.

## 5. Architecture

Three clearly separated layers:

```
revolut-business-cli/
  src/
    generated/      # OpenAPI Generator output (typescript-fetch). DO NOT hand-edit.
    auth/           # JWT signing, token exchange/refresh, on-disk token cache
    cli/            # commander command definitions; inject token into the generated
                    # Configuration; auto-paginate; serialize results to JSON
    index.ts        # CLI entrypoint
  package.json
  README.md
```

- **`generated/`** is fully regenerated from `json/business.json` and never edited by
  hand, so a future Revolut `spec release` is absorbed by re-running the generator.
- **`auth/`** is the only hand-written network code (the OAuth host is outside the spec).
- **`cli/`** is a thin shell: parse args → ensure token → call a generated API method →
  print normalized JSON. No business logic.

## 6. Command surface

All list/get commands print JSON to stdout by default (the primary consumer is the
skill/LLM). `--pretty` renders a human table instead. `--sandbox` is a global flag that
targets `https://sandbox-b2b.revolut.com/api/1.0`.

```
revolut auth setup                       # one-time OAuth consent → store refresh_token
revolut auth status                      # report token validity (debug; no secrets printed)

revolut expenses list --state <state> --from <ISO> --to <ISO> [--type <t>] [--account <id>]
revolut expenses get <expense_id>
revolut receipts download <expense_id> [--receipt <receipt_id>] --out <dir>

revolut transactions list --from <ISO> --to <ISO> [--account <id>] [--type <t>]
revolut transactions get <id>

revolut accounts list
revolut categories list                  # accounting-categories
revolut tax-rates list
```

- `--from`/`--to` accept ISO dates (`2026-01-01`) or date-times; the CLI auto-paginates
  the full window.
- `receipts download` resolves `receipt_ids` from the expense and downloads each (or just
  `--receipt <id>`) to `--out`, naming files `{expense_id}_{receipt_id}.<ext>` with the
  extension derived from the response content-type.

### Output shape (example: `expenses list`)

Straight passthrough of the API `Expense` schema, normalized:

```jsonc
{
  "expenses": [
    {
      "id": "uuid",
      "transaction_id": "uuid",
      "state": "missing_info",
      "transaction_type": "card_payment",
      "merchant": "Picard",
      "payer": "…",
      "expense_date": "2026-01-20",
      "spent_amount": { "amount": 73.61, "currency": "EUR" },
      "description": null,
      "receipt_ids": [],
      "splits": [
        { "amount": { "amount": 73.61, "currency": "EUR" }, "category": null, "tax_rate": null }
      ],
      "labels": {},
      "submitted_at": "…",
      "completed_at": "…"
    }
  ]
}
```

The consumer reads `description: null` / `receipt_ids: []` / `splits[].category: null`
to decide what is missing, and does its own matching against local justificatives. The
CLI makes none of those decisions.

## 7. Code generation

```bash
openapi-generator-cli generate \
  -i ../json/business.json \
  -g typescript-fetch \
  -o src/generated \
  --additional-properties=supportsES6=true,typescriptThreePlus=true
```

Exposed as an npm script (`npm run gen`) so regenerating after a Revolut `spec release`
is a single command. The generated client is committed (so consumers don't need the
generator installed) but treated as a build artifact — never hand-edited.

## 8. Error handling

- Network / non-2xx API errors → human-readable message to **stderr**, **nonzero exit
  code**; no partial JSON on stdout.
- Auth failures (expired refresh token, missing config) → actionable message pointing at
  `revolut auth setup`.
- `--sandbox` mismatch (token minted for the other environment) → explicit error rather
  than a confusing 401.

## 9. Testing

- **Unit:** auth token cache + refresh logic with a mocked `/auth/token` (valid token
  reuse, expiry boundary, refresh-on-expiry, refresh-token-rejected).
- **Integration:** run `expenses list` / `transactions list` against the **sandbox**
  server, seeding data via `/sandbox/topup` and `/sandbox/transactions/{id}/{action}`.
- **Output contract:** snapshot the normalized JSON shape so schema drift after a
  generator regen is caught.

## 10. Open items (resolve during implementation)

- Confirm the exact `/auth/token` host + request encoding against Revolut's
  "make your first API request" guide (the spec omits it).
- Confirm receipt `content` response media types to pick the right download extension.
- Decide packaging: `npx`-runnable via `bin` in `package.json` vs a global install.
