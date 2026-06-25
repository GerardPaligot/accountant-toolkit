# YAML schema — Receipt analyses

> Normalized format to describe a receipt (cash receipt, invoice, voucher) in a way that is agnostic of the target tool (Tiime, Revolut Business, other).
> One fiche per receipt. File name: identical to the source receipt but with the `.yaml` extension.
> Example: `picard_surgeles_20251224_87128474.jpg` → `picard_surgeles_20251224_87128474.yaml`
>
> **This is the normative reference shipped with the `justificatif-describe` skill.** It is read at runtime from `$SKILL_DIR/SCHEMA.md` — the consumer does not need a copy in their workspace. The companion skill `enrich-justificatifs` reads the same file.

## Conventions

- **Encoding**: UTF-8.
- **Amounts**: decimal, decimal point, no currency symbol (except the `currency` field).
- **Dates**: ISO 8601 `YYYY-MM-DD`.
- **Unknown / not-applicable fields**: `null`. Do not leave an empty string.
- **Empty arrays**: explicit `[]` (no omission).

## Fields

### `file` (required)
Metadata of the source document.
```yaml
file:
  name: <string>                     # original file name
  type: cash-receipt | invoice | receipt | note | other
  pages: <int|null>                  # number of pages (multi-page PDF)
```

### `merchant` (required)
Identification of the supplier.
```yaml
merchant:
  name: <string>                     # official legal name if known, otherwise trade name
  trade_name: <string|null>          # commercial name if different
  siret: <string|null>               # 14 digits FR
  vat_number: <string|null>          # ex: FR00000000000, LU00000000
  rcs: <string|null>                 # ex: "Luxembourg B 000000"
  address: <string|null>             # full address on one line
  country: FR | EU | NON_EU
  marketplace: <string|null>         # ex: "Amazon EU S.à r.l." if third-party seller
```

### `document` (required)
Identification of the document.
```yaml
document:
  date: YYYY-MM-DD                   # transaction / invoice date
  time: <HH:MM|null>
  number: <string|null>              # ticket / invoice no.
  payment_reference: <string|null>
  order_reference: <string|null>     # for e-commerce
```

### `amounts` (required)
```yaml
amounts:
  currency: EUR | USD | GBP | ...
  total_incl_tax: <decimal>          # actual total incl. tax paid
  total_excl_tax: <decimal>          # total excl. tax
  discounts: <decimal|null>          # total discounts (positive value)
  vat:
    - rate_pct: <number>             # 0, 5.5, 10, 20, ...
      base_excl_tax: <decimal>
      amount: <decimal>
  payment_method: CB | virement | especes | titre-restaurant | prelevement | paypal | autre | null
```

### `nature` (required)
Factual description of what was purchased.
```yaml
nature:
  category: >
    restauration | alimentation | materiel-informatique | logiciel-saas |
    fournitures | mobilier | deplacement-transport | deplacement-hebergement |
    deplacement-stationnement | telecom | energie | honoraires |
    formation | abonnement-presse | divers
  short_description: <string>        # 1 synthetic line
  details: [<string>...]             # list of the receipt's key items
  client_identity_on_document: <string|null>  # ex: name printed on a loyalty card
```

### `business_context`
Link to the company's activity. Decisive field for deductibility.
```yaml
business_context:
  business_link: <string|null>       # ex: "client trip to <city> on <date>"
  guest: <string|null>               # name + company for a client meal
  reason: <string|null>              # purpose of the meeting / trip
  location: <string|null>            # city, country
```

### `tax_analysis` (required)
Reasoned deductibility position.
```yaml
tax_analysis:
  corporate_tax_deductibility:
    status: yes | no | conditional
    reason: <string>
    references: [<string>...]        # ex: ["art. 39-5-f CGI", "BOI-BIC-CHG-40-60-50-20"]
  vat_deductibility:
    status: yes | no | not-applicable
    recoverable_amount: <decimal>
    reason: <string>
    eu_reverse_charge: <bool>        # true if EU VAT to reverse-charge on CA3
  suggested_gl_account:
    number: <string>                 # ex: "606800"
    label: <string>                  # ex: "Fournitures non stockables — matériel info"
  fixed_asset:
    required: <bool>
    threshold_exceeded: <bool>       # > 500 € HT
    depreciation_years: <number|null>
```

### `alerts`
Fiscal or accounting signals detected.
```yaml
alerts:
  - code: <string>                   # cf. code table below
    severity: info | warning | critical
    message: <string>
```

Standard alert codes:
- `FOREIGN_VAT_NON_DEDUCTIBLE` — VAT from another EU/NON-EU State not recoverable in France
- `EU_REVERSE_CHARGE_REQUIRED` — intra-community acquisition (true direct B2B EU, excluding marketplace facilitator)
- `FIXED_ASSET_THRESHOLD` — > 500 € HT, to capitalize
- `TAXPAYER_POSITION` — the taxpayer's decision ≠ doctrinal position, see `prior_decision`
- `RECEIPT_INCOMPLETE` — document missing / illegible / without a mandatory mention
- `POSSIBLE_DOUBLE_BILLING` — risk of double reimbursement (e.g. a business trip whose meals may also be reimbursed by the client)
- `LIKELY_PERSONAL_PURPOSE` — likely personal use
- `PERSONAL_PAYMENT` — paid from personal account (to rebill via the partner's current account, PCG 4551)

### `prior_decision`
Reference to a decision already made in the project (memory / PROJET.md / Excel audit).
```yaml
prior_decision:
  source: <string|null>              # ex: "memory/audit-decisions.md"
  position: <string|null>            # summary of the decision
  date: <YYYY-MM-DD|null>
```

### `info_to_complete`
Actionable checklist for the user before final booking. Emptied as items are provided via the `enrich-justificatifs` skill.
```yaml
info_to_complete:
  - <string>                         # ex: "Guest name and purpose of the meal"
```

### `additional_information`
Information provided by the user **after** the initial extraction, via the `enrich-justificatifs` skill. Distinguishes what is extracted from the document (sources `merchant`, `document`, `amounts`, `nature`) from what is declarative (provided by the user). Allows tracing the date and reason of each enrichment.
```yaml
additional_information:
  completion_date: <YYYY-MM-DD|null> # date of the info input
  provided_by: <string|null>         # who provided the information
  notes: [<string>...]               # elements freely provided
  resolutions:                       # alerts resolved by this enrichment
    - alert_code: <string>
      resolution: <string>           # ex: "Guest documented → alert cleared"
      previous_corporate_tax_status: <yes|no|conditional|null>
      new_corporate_tax_status: <yes|no|conditional|null>
```

When an enrichment is provided:
1. The relevant fields (`business_context.guest`, `business_context.reason`, etc.) are **updated directly**.
2. The corresponding `info_to_complete` items are **removed from the list**.
3. The resolved `alerts` are **removed from the list** and recorded in `additional_information.resolutions`.
4. If the resolution lifts the conditional nature of deductibility, `tax_analysis.corporate_tax_deductibility.status` may move from `conditional` to `yes` (with an update of the `reason`).
5. The `summary` is updated if relevant.

### `summary` (required)
1-2 sentence synthesis in readable French. Allows a quick read without unpacking the whole YAML.
```yaml
summary: <string>
```

## Structure of a complete file

```yaml
file: { ... }
merchant: { ... }
document: { ... }
amounts: { ... }
nature: { ... }
business_context: { ... }
tax_analysis: { ... }
alerts: [ ... ]
prior_decision: { ... }
info_to_complete: [ ... ]
summary: ...
```

## Aggregated index file

An `_index.yaml` file (generated after a batch) consolidates:
- Totals HT / TTC / TVA by category and by month
- Number of alerts by code and by severity
- List of incomplete receipts
- Lines requiring accountant arbitration

## Schema maintenance

To be updated when:
- A new alert code appears
- A new expense category enters the company's scope
- The PCG or fiscal doctrine changes

Any backward-compatible change (field added with a default value). Breaking (rename, deletion): re-run the batch.
