# YAML schema — Personal tax documents (income tax, local taxes, return, credit advance)

> Normalized format to describe the **personal** tax documents of the tax household (≠ company accounting). One fiche per document, placed next to the source PDF in the `income-tax/<type>/` subfolder.
>
> Covers **4 types of DGFiP documents** discriminated by the `document_type` field (schema `.schemas/tax-document.schema.yaml`):
> 1. `income-tax-notice` — Income tax notice (issued in year N+1 on year N income)
> 2. `property-tax` — Annual property tax notice
> 3. `pre-filled-return` — Automatic pre-filled income return sent by the DGFiP (to validate/amend)
> 4. `credit-advance` — Letter for the 60% advance of tax credits/reductions (paid mid-January)
>
> Plus **1 forecast estimate type** produced by Claude BEFORE the official return (separate schema `.schemas/income-tax-estimate.schema.yaml`):
> - `income-tax-estimate` — Forecast income-tax calculation for a fiscal year (income assumptions, shares, bracket scale application, low/central/high range, recommendations). Stored in `income-tax/estimates/<annee>_estimation.yaml`. Kept for ex-post comparison with the actual income tax notice. See the dedicated section further down.
>
> For **payslips**, see the `bulletin-salaire-describe` skill's `SCHEMA.md` (separate schema).
>
> **This is the normative reference shipped with the `fiches-fiscales-describe` skill.** It is read at runtime from `$SKILL_DIR/SCHEMA.md` — the consumer does not need a copy in their workspace.

## Conventions

- **Encoding**: UTF-8.
- **Amounts**: decimal, decimal point, no currency symbol. Currency = EUR (implicit).
- **Dates**: ISO 8601 `YYYY-MM-DD`.
- **Unknown / not-applicable fields**: `null`. No empty string.
- **Empty arrays**: explicit `[]`.
- **File naming convention**:
  - `income-tax-notice`: `<annee_revenus>_avis-ir.{pdf,yaml}` (ex `2024_avis-ir.pdf` for the notice issued in 2025 on 2024 income)
  - `property-tax`: `<annee_imposition>_taxes-foncieres.{pdf,yaml}` (ex `2025_taxes-foncieres.pdf`)
  - `pre-filled-return`: `<annee_revenus>_declaration-auto.{pdf,yaml}` (ex `2025_declaration-auto.pdf` even if received in 2026)
  - `credit-advance`: `<annee_versement>_avance-credits.{pdf,yaml}` (ex `2026_avance-credits.pdf` for the January 2026 transfer)

## Common fields (all types)

### `file` (required)
```yaml
file:
  name: <string>                      # original file name
  normalized_name: <string>           # canonical name per the convention above
  pages: <int>
```

### `document_type` (required)
```yaml
document_type: income-tax-notice | property-tax | pre-filled-return | credit-advance
```

### `tax_household` (required)
Identification of the household.
```yaml
tax_household:
  taxpayer_1:
    first_name: <string>              # ex: Jean
    name: <string>                    # birth name
    usage_name: <string|null>
    tax_number: <string>              # 13 digits with spaces (ex: "99 99 999 999 999")
    key: <string>                     # stable per-person slug, ex: taxpayer1
    birth_date: <YYYY-MM-DD|null>
    birth_place: <string|null>
  taxpayer_2:                         # null if single
    first_name: <string|null>
    name: <string|null>
    usage_name: <string|null>
    tax_number: <string|null>
    key: <string|null>
    birth_date: <YYYY-MM-DD|null>
    birth_place: <string|null>
  marital_status: M | C | D | V | O   # Marié(e) | Célibataire | Divorcé(e) | Veuf(ve) | Pacsé(e)
  tax_shares: <decimal>
  dependents_count: <int>
  children_birth_years: [<int>...]
  tax_address: <string>
```

### `administrative_references`
Useful identifiers to exchange with the DGFiP.
```yaml
administrative_references:
  notice_reference: <string|null>     # ex: "00 00 0000000 00"
  fip_number: <string|null>
  role_number: <string|null>
  service_identifier: <string|null>   # ex: "00000"
  public_finance_center: <string|null>
  issue_date: <YYYY-MM-DD|null>
  recovery_date: <YYYY-MM-DD|null>
```

### `alerts`
Signals to surface to the human.
```yaml
alerts:
  - code: <string>
    severity: info | warning | critical
    message: <string>
```

Standard alert codes:
- `EURL_INCOME_NOT_COUNTED` — the pre-filled return does not contain the company manager remuneration (to add manually)
- `TAX_CREDIT_TO_DECLARE` — credits/reductions received the previous year, recurring expenses to declare for the current year
- `CESU_PAJE_EMPLOYER` — CESU-PAJE income detected (= the household EMPLOYS someone → 50% personal-services tax credit to declare)
- `EXEMPT_OVERTIME_HOURS` — exempt overtime hours detected (box 1HH/1IH, up to 7,500 € exempt in 2025)
- `PER_CAP_AVAILABLE` — large cumulative retirement-savings cap, tax reduction opportunity
- `BALANCE_DUE` — an amount remains to be paid after WHT
- `ADVANCE_BELOW_CREDITS` — the advance received will probably be lower than the credits to declare → complementary payment to expect
- `ADVANCE_ABOVE_CREDITS` — risk of repaying an overpayment in September
- `RETURN_TO_AMEND` — the auto pre-filled return must be amended (do not settle for "do nothing")
- `FAMILY_SITUATION_CHANGE` — birth, marriage, divorce detected or expected
- `FAMILY_QUOTIENT_CAP_ACTIVE` — family-quotient gain capped (displayed marginal rate > actual bracket/share)
- `PAYMENT_SCHEDULE` — payment spread over several withdrawals (to provision)

### `summary` (required)
1-2 sentence synthesis in readable French.
```yaml
summary: <string>
```

## Type-specific fields

### Type `income-tax-notice`

```yaml
income_year: <int>                    # year of taxed income (ex: 2024)
issue_year: <int>                     # year of the notice (= income_year + 1)

income:
  taxpayer_1:
    declared_salaries: <decimal>
    declared_exempt_overtime_hours: <decimal|null>
    net_exempt_overtime_hours: <decimal|null>
    deduction_10pct_or_actual_expenses: <decimal>
    net_salaries_after_deduction: <decimal>
  taxpayer_2:
    declared_salaries: <decimal|null>
    declared_exempt_overtime_hours: <decimal|null>
    net_exempt_overtime_hours: <decimal|null>
    deduction_10pct_or_actual_expenses: <decimal|null>
    net_salaries_after_deduction: <decimal|null>
  total_net_salaries: <decimal>
  other_income: [<string>...]         # short labels if present

taxation:
  gross_total_income: <decimal>
  taxable_income: <decimal>
  tax_before_credits: <decimal>
  tax_credits:
    - label: <string>                 # ex: "Frais de garde des jeunes enfants"
      declared: <decimal>
      retained: <decimal>
  net_tax: <decimal>

balance:
  tax_owed: <decimal>
  wht_withheld: <decimal>
  credit_advance_received: <decimal>  # +/- sign depending on context
  balance_due: <decimal>              # positive if to pay, negative if refund
  schedule:                           # if balance > 300 €, spread over the last 4 months
    - date: <YYYY-MM-DD>
      amount: <decimal>

indicators:
  reference_tax_income: <decimal>
  average_tax_rate_pct: <decimal>
  marginal_tax_rate_pct: <decimal>

retirement_savings_cap:
  taxpayer_1:
    total_cap_2023: <decimal>
    unused_2022: <decimal>
    unused_2023: <decimal>
    unused_2024: <decimal>
    computed_on_2024: <decimal>
    available_2025: <decimal>
  taxpayer_2: { ... }                 # same fields or null
```

### Type `property-tax`

```yaml
tax_year: <int>                       # ex: 2025

property:
  address: <string>
  owner_number: <string|null>         # ex: "000 P00000 X"
  debtors:
    - name: <string>
      right: <string>                 # ex: PROP/INDIVIS, US/INDIVIS, NU/INDIVIS
      identifier: <string|null>       # ex: "XXXXXX"

department:
  code: <string>                      # ex: "000"
  name: <string>                      # ex: "<DEPARTMENT>"
municipality:
  code: <string>                      # ex: "000"
  name: <string>                      # ex: "<MUNICIPALITY>"

built_properties:
  base: <decimal>                     # tax base retained
  taxes:
    - label: commune | syndicat_communes | intercommunalite | taxes_speciales | taxes_ordures_menageres | taxe_gemapi | autre
      rate_pct_2024: <decimal|null>
      rate_pct_2025: <decimal>
      contribution: <decimal>
      variation_pct_vs_n_1: <decimal|null>
  total_contribution: <decimal>
  management_fees: <decimal>
  total: <decimal>

unbuilt_properties:                   # generally empty for a primary residence
  base: <decimal|null>
  taxes: []
  total_contribution: <decimal|null>

due_payment:
  amount_due: <decimal>
  payment_deadline: <YYYY-MM-DD>
  modality: en-ligne | prelevement-echeance | prelevement-mensuel | autre

information:
  th_compensation_primary_residences: <decimal|null>  # ex: 000000 € for the municipality
```

### Type `pre-filled-return`

```yaml
income_year: <int>                    # ex: 2025
filing_year: <int>                    # ex: 2026

issue_date: <YYYY-MM-DD|null>
address_on_jan_1: <string>            # address on January 1st of the filing year
iban: <string|null>                   # partially masked
bic: <string|null>
online_access_number: <string|null>

pre_filled_income:
  - person_key: <string>              # ex: taxpayer1
    category: <string>                # "TRAITEMENTS ET SALAIRES" | "REVENUS CESU-PAJE" | "HEURES SUPPLEMENTAIRES EXONEREES" | ...
    box: <string>                     # ex: "1AJ", "1BJ", "1BA", "1HH"
    amount: <decimal>
    wht_already_paid: <decimal>
    detail:
      - source: <string>              # ex: "<EMPLOYER A>", "<EMPLOYER B>", "<HOME EMPLOYEE>"
        amount: <decimal>
        wht: <decimal>

estimated_tax:
  tax_before_credits: <decimal>
  tax_credits: <decimal>
  net_tax: <decimal>
  credit_advance_received: <decimal>  # + sign
  wht_already_paid: <decimal>         # - sign
  wht_installment_paid: <decimal>
  overpayment_refund: <decimal>
  remaining_amount_due: <decimal>     # positive = to pay
  estimated_reference_tax_income: <decimal>
  shares_count: <decimal>

new_wht_rate:
  household_rate_pct: <decimal>
  person_1_rate_pct: <decimal>
  person_2_rate_pct: <decimal|null>
  application_date: <YYYY-MM-DD>      # ex: 2026-09-01

to_complete:
  - <string>                          # human checklist of what is MISSING and must be added by hand
```

### Type `credit-advance`

```yaml
payment_year: <int>                   # ex: 2026
credits_origin_year: <int>            # year of the expenses that generated the credits (ex: 2024)

advance_amount: <decimal>             # ex: 257
disbursement_date: <YYYY-MM-DD>
transfer_label: <string>              # ex: "AVANCE CREDIMPOT"
credited_iban: <string|null>

calculation_base:
  credits_reductions_previous_year: <decimal|null>     # = 100% of the validated expenses
  advance_percentage_pct: <decimal>                    # generally 60%
  categories_concerned: [<string>...]                  # ex: ["garde-enfants", "services-personne", "dons"]

expected_adjustment:
  description: <string>               # explanation of the advance vs balance mechanism
  balance_date: <YYYY-MM-DD|null>     # typically summer of the filing year
```

## Type `income-tax-estimate` (separate forecast fiche)

Distinct formal schema: `.schemas/income-tax-estimate.schema.yaml`. This fiche is NOT a received DGFiP document but an estimate produced by Claude (skill `fiches-fiscales-describe`) before the official return. Kept for comparison with the actual notice.

```yaml
file:
  normalized_name: <YYYY>_estimation.yaml
  generation_date: <YYYY-MM-DD>

document_type: income-tax-estimate

fiscal_year: <int>                    # year of estimated income (ex: 2026)
filing_year: <int>                    # year of the return and balance (ex: 2027)

tax_household: { ... }                # as for the other types
  estimated_tax_shares: <decimal>     # forecast shares (may differ from N-1 if family event)
  family_events_year: [<string>...]   # birth, marriage, etc.

income_assumptions:
  taxpayer_1:
    key: <string>
    sources:                          # detailed list of the projected income sources
      - type: <string>                # salaire, ijss-maternite, are-chomage, remuneration-gerance-eurl-art62, hs-exonerees, cesu-paje, ...
        box: <string>                 # 1AJ, 1BJ, 1GB, 1AP, 1HH, 1BA...
        period: <string|null>
        estimated_taxable_net: <number>
        notes: <string|null>
    estimated_taxable_net_total: <number>
  taxpayer_2: { ... }

calculation:
  taxable_income_before_allowance: <number>
  allowance_10pct: { taxpayer_1, taxpayer_2, total }
  taxable_income_after_allowance: <number>
  tax_shares: <number>
  family_quotient: <number>
  bracket_scale_used: <string>        # description of the projected bracket scale
  bracket_application_per_share: [ { tranche, taux_pct, impot } ]
  tax_per_share: <number>
  household_gross_tax: <number>
  family_quotient_cap:
    active: <bool>
    reason: <string|null>             # justification of the cap / no cap
  estimated_net_tax: <number>

estimated_wht: { taxpayer_1, taxpayer_2, total, notes }

balance:
  estimated_tax_owed: <number>
  estimated_wht_paid: <number>
  credit_advance_to_adjust: <number|null>
  estimated_balance_due: <number>     # positive = to pay, negative = refund
  payment_schedule: <string|null>

range:
  low:     { assumptions: <string>, estimated_tax_owed, balance }
  central: { assumptions: <string>, estimated_tax_owed, balance }
  high:    { assumptions: <string>, estimated_tax_owed, balance }

estimated_marginal_rate:
  average_rate_pct: <number>
  gross_marginal_rate_pct: <number>
  quotient_capped: <bool>
  notes: <string|null>

recommendations: [<string>...]        # actions to carry out for the year

alerts: [...]                         # same codes as the DGFiP fiches + specific ones:
                                      #   ESTIMATE_STRONG_ASSUMPTIONS, MARGINAL_RATE_REVISED_<YYYY>,
                                      #   WHT_ZERO_EURL_REMUNERATION, BALANCE_DUE_<YYYY>

summary: <string>

methodology_sources: [<string>...]    # CGI articles, BOFiP, memory fiches, payslips, etc.
```

Naming convention: `<fiscal_year>_estimation.{yaml}` placed in `income-tax/estimates/`. One fiche per fiscal year.

## Structure of a complete file

```yaml
file: { ... }
document_type: <type>
tax_household: { ... }
administrative_references: { ... }
# … type-specific fields …
alerts: [ ... ]
summary: ...
```

## Aggregated index file

`income-tax/_index.yaml` (at the root of `income-tax/`) consolidates **all** the household's tax documents by year:

```yaml
meta:
  generation_date: <YYYY-MM-DD>
  schema_version: "1.0"
years:
  <YYYY>:
    income_tax_notice:
      income_year: <int>
      rfr: <decimal>
      net_tax: <decimal>
      wht_paid: <decimal>
      balance: <decimal>
      average_rate_pct: <decimal>
      marginal_rate_pct: <decimal>
      file: <path>
    pre_filled_return:
      income_year: <int>
      estimated_tax: <decimal>
      remaining_amount_due: <decimal>
      estimated_rfr: <decimal>
      shares_count: <decimal>
      file: <path>
    property_tax:
      total: <decimal>
      deadline: <YYYY-MM-DD>
      file: <path>
    credit_advance:
      amount: <decimal>
      disbursement_date: <YYYY-MM-DD>
      file: <path>
    household_payslips:                         # cross-index reference
      total_taxable_net: <decimal>
      total_wht: <decimal>
      detail: payslips/_index.yaml
critical_alerts: [ <path>... ]
```

## Schema maintenance

To be updated when:
- A new type of tax document appears (ex: CSG/CRDS notice on capital income, IFI, exit tax)
- The DGFiP changes the format of an existing document (ex: new box)
- The household changes situation (marriage, divorce, etc.) → potentially new fields

Any backward-compatible change (field added with a default value). Breaking: re-run the batch.
