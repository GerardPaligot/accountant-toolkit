# revolut-business-cli

Read-only CLI over the official Revolut Business API. Fetches expenses,
transactions, receipts, and reference data; prints clean JSON to stdout
(the native API response, verbatim — snake_case keys). Does **no** matching,
uploading, or editing: the public Business API has no write path for
receipts/expenses, so those actions stay in the browser-automation skill.
This CLI exists to replace that skill's slow inventory phase with one fast,
deterministic API call.

## Setup

1. Enroll an API certificate in Revolut Business → Settings → APIs and note
   the `client_id`, your JWT `issuer`, the private-key path, and a
   `redirect_uri`.
2. Provide config via env or `~/.config/revolut-cli/config.json`:
   - `REVOLUT_CLIENT_ID`, `REVOLUT_ISSUER`, `REVOLUT_PRIVATE_KEY` (path),
     `REVOLUT_REDIRECT_URI`, and (after setup) `REVOLUT_REFRESH_TOKEN`.
   - `REVOLUT_CONFIG_DIR` overrides the config directory (default
     `~/.config/revolut-cli`).
3. `npm install && npm run gen && npm run build`
4. `revolut auth setup` — one-time consent; stores the refresh token.

## Commands

- `revolut expenses list --state missing_info --from <iso> --to <iso> [--type <t>]`
- `revolut expenses get <id>`
- `revolut receipts download <expenseId> --out ./dir [--receipt <id>]`
- `revolut transactions list --from <iso> --to <iso> [--type <t>] [--account <id>]`
- `revolut transactions get <id>`
- `revolut accounts list`
- `revolut categories list`
- `revolut tax-rates list`
- `revolut auth setup` / `revolut auth status`

Global flags: `--sandbox` (target the sandbox host), `--pretty` (human table
instead of JSON).

## Regenerating the client

`npm run gen` re-runs OpenAPI Generator against `../json/business.json`
(`--skip-validate-spec` is required: Revolut's published spec has schema-quality
issues the validator rejects). Never hand-edit `src/generated/`.
