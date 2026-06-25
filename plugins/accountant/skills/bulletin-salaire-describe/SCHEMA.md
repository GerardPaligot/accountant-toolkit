# YAML schema — Payslips (income-tax return)

> Normalized format to describe a payslip of a member of the tax household. One fiche per payslip, placed next to the source PDF under `income-tax/payslips/YYYY/<person>/`.
>
> Depth: **income-tax-essential + aggregates** — metadata + Gross / Taxable net / Social net / Net pay / WHT withheld + annual cumulative totals. Sufficient to reconstitute the taxable base and the WHT already paid without re-reading the PDF.
>
> Naming convention: `YYYY-MM_<employer-kebab>.yaml`. End-of-employment payslips: `_solde` suffix (ex `2025-11_employer-a_solde.yaml`).
> Example: `bulletin-de-salaire-du-2025-01-01-au-2025-01-31.pdf` → `2025-01_employer-a.yaml`.
>
> **This is the normative reference shipped with the `bulletin-salaire-describe` skill.** It is read at runtime from `$SKILL_DIR/SCHEMA.md` — the consumer does not need a copy in their workspace.

## Conventions

- **Encoding**: UTF-8.
- **Amounts**: decimal, decimal point, no currency symbol. Currency = EUR (implicit).
- **Dates**: ISO 8601 `YYYY-MM-DD`.
- **Unknown / not-applicable fields**: `null`. No empty string.
- **Empty arrays**: explicit `[]`.
- **Fiscal year** = year in which the income becomes taxable = year of the period end date (= year of payment in 99% of cases). A payslip from 01/12/2025 to 31/12/2025 paid on 31/12/2025 → `fiscal_year: 2025`.

## Fields

### `file` (required)
```yaml
file:
  name: <string>                     # original file name (before renaming)
  normalized_name: <string>          # canonical name YYYY-MM_employer.pdf
  pages: <int>
```

### `person` (required)
Identification of the employee.
```yaml
person:
  first_name: <string>               # ex: "Jean"
  name: <string>                     # ex: "Dupont"
  key: <string>                      # stable per-person slug for bucketing, ex: "jdupont"
  employee_id: <string|null>
  social_security_number: <string|null>
  birth_date: <YYYY-MM-DD|null>
```

### `employer` (required)
```yaml
employer:
  name: <string>                     # official legal name
  siren: <string|null>               # 9 digits
  siret: <string|null>               # 14 digits
  ape: <string|null>                 # ex: "8891A"
  address: <string|null>
  collective_agreement: <string|null>
  company_entry_date: <YYYY-MM-DD|null>
  establishment_entry_date: <YYYY-MM-DD|null>
  exit_date: <YYYY-MM-DD|null>       # filled if end of employment
```

### `period` (required)
```yaml
period:
  start: <YYYY-MM-DD>
  end: <YYYY-MM-DD>
  fiscal_year: <int>                 # year of the end date (= taxation year)
  calendar_month: <string>           # "YYYY-MM" — for index bucketing
  payment_date: <YYYY-MM-DD|null>
  partial: <bool>                    # true if period < full month (entry/exit)
```

### `monthly_amounts` (required)
All amounts relate to **this payslip alone**, not to the cumulative total.
```yaml
monthly_amounts:
  gross: <decimal>                   # "Salaire Brut" / "Total Brut"
  taxable_net: <decimal>             # monthly IR base
  social_net: <decimal>              # new legal line since 2023
  net_pay_before_tax: <decimal>      # what would have been paid without WHT
  net_pay: <decimal|null>            # what is actually paid (after WHT, including off-payroll items such as profit-sharing)
  wht_withheld: <decimal>            # income tax withheld at source
  wht_rate_pct: <decimal|null>       # ex: 6.50, 7.50
  hours_worked: <decimal|null>       # ex: 151.67, 169.00
  employee_contributions: <decimal|null> # total employee withholdings
```

### `year_to_date` (required)
Annual cumulative totals as printed on the payslip (= the "bottom line"). Allows quickly checking consistency and filling box 1AJ / 1BJ without recomputing.
```yaml
year_to_date:
  gross: <decimal>
  taxable_net: <decimal>
  wht: <decimal>
  employee_contributions: <decimal|null>
  hours: <decimal|null>
```

### `special_items`
Non-recurring items that fall outside the base salary and affect the IR or the reading of the payslip. Empty `[]` for a regular payslip.
```yaml
special_items:
  - label: <string>                  # ex: "Prime de fin d'année", "Indemnité CP année N", "Intéressement net placé"
    amount: <decimal>
    income_tax_impact: <string>      # ex: "imposable", "non imposable (placé PEE)", "exonéré HS/HC"
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
- `FINAL_SETTLEMENT_PAYSLIP` — end of contract with CP indemnities / adjustment / half-day balance
- `PAYSLIP_PARTIAL` — period < full month (entry or exit)
- `PAYSLIP_MISSING` — gap in the monthly series detected via the cumulative total (opened in the fiche of the month AFTER the gap)
- `WHT_ZERO_WITH_INCOME` — WHT = 0 while taxable net > 0 (household rate or change of situation)
- `WHT_RATE_CHANGE` — WHT rate different from the previous month
- `CUMULATIVE_VS_MONTH_GAP` — annual cumulative total inconsistent with the sum of the previous payslips
- `EXCEPTIONAL_BONUS` — non-recurring bonus (one-off impact on the IR base)
- `PROFIT_SHARING_INVESTED` — amounts invested in PEE / PERCO (non-taxable, NOT to report on 1AJ)
- `PROFIT_SHARING_PAID` — amounts paid to a bank account (potentially taxable if beyond the exemption cap)
- `EMPLOYER_CHANGE` — new employer during the year
- `PAYSLIP_CORRECTION` — correction payslip for a previous month

### `summary` (required)
1-2 sentence synthesis in readable French.
```yaml
summary: <string>
```

## Structure of a complete file

```yaml
file: { ... }
person: { ... }
employer: { ... }
period: { ... }
monthly_amounts: { ... }
year_to_date: { ... }
special_items: [ ... ]
alerts: [ ... ]
summary: ...
```

## Aggregated index file

`_index.yaml` (at the root of `payslips/`) consolidates the fiches by **year × person**:

```yaml
meta:
  generation_date: YYYY-MM-DD
  payslips_count: <int>
  schema_version: "1.0"
years:
  <YYYY>:
    <person_key>:
      employers: [ <name>... ]
      months_covered: <int>
      missing_payslips: [ "YYYY-MM"... ]       # detected via cumulative-total gaps
      total_gross: <decimal>
      total_taxable_net: <decimal>            # = box 1AJ / 1BJ base
      total_wht: <decimal>                    # = box 8HV / 8IV base
      payslips:
        - month: "YYYY-MM"
          file: <relative path>
          gross: <decimal>
          taxable_net: <decimal>
          wht: <decimal>
          alerts: <int>                       # number of alerts (all severities)
household_totals:
  <YYYY>:
    taxable_net: <decimal>                    # sum of the household's taxable nets
    wht_total: <decimal>
    payslips_total: <int>
critical_alerts: [ <yaml path>... ]
```

## Schema maintenance

To be updated when:
- A new recurring special item appears (ex: an exceptional bonus of a new type)
- A new alert code is needed for an uncovered case
- The payslip format evolves (ex: new legal line post-2026)

Any change must remain backward-compatible (field added with a default value). Breaking: re-run the batch.
