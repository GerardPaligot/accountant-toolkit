---
name: bulletin-salaire-describe
description: Use this skill to analyze new payslips (bulletins de salaire) deposited at the root of `$WORKSPACE/income-tax/payslips/`. Produces a structured YAML fiche per the bundled `SCHEMA.md`, files it into `YYYY/<person>/`, and refreshes `_index.yaml` with annual totals for the income-tax return. Trigger when the user says « analyse les bulletins de salaire », « traite les nouveaux bulletins », « classe ce bulletin », « prépare l'IR à partir des bulletins ».
---

# Skill — Analysis and sorting of payslips for the income-tax return

## Overview

Skill to process the new payslips of the tax household deposited at the root of `income-tax/payslips/`. Produces a YAML fiche compliant with `SCHEMA.md`, files the PDF in `YYYY/<person>/`, and updates the aggregated index that consolidates the annual taxable bases (boxes 1AJ/1BJ + WHT 8HV/8IV) for the income-tax return.

## When to use

- The user deposits one or more new PDF files in `$WORKSPACE/income-tax/payslips/` (root = inbox)
- The user explicitly asks: « analyse les bulletins », « traite ce bulletin », « classe les bulletins », « prépare la déclaration IR »
- Before validating the pre-filled income-tax return

**Do not use for**: expense receipts (`receipts/`), tax notices / property taxes / tax-credit advances (PDFs at the root of `income-tax/`), EURL management-remuneration slips (an EURL TNS majority manager has no classic payslip — check PROJET.md for the household profile).

## Procedure

### Step 1 — Bootstrap

If the conversation is new, run the `bootstrap-projet` skill first to load the context (EURL profile, tax household, memory).

### Step 2 — Inventory the inbox

```bash
cd $WORKSPACE/income-tax/payslips
ls *.pdf 2>/dev/null
```

The files at the root (PDF) are the inbox to process. `_index.yaml` and the `YYYY/` subfolders stay in place — do not touch them.

### Step 3 — Load the schema

Read `$SKILL_DIR/SCHEMA.md` (the schema bundled with this skill) for a reminder of the fields and alert codes. **Every fiche must strictly comply with the schema**.

### Step 4 — For each payslip

1. **Read** the PDF with `Read` (Claude reads the payslips directly).
2. **Identify the person**:
   - "Nom" field on the payslip → map to the canonical `person_key` using the household member list in PROJET.md (loaded during bootstrap).
   - If the name is not in PROJET.md: ask the user to identify the person before proceeding.
3. **Identify the employer**:
   - The payslip's company name → kebab-case slug using the known employers list in PROJET.md.
   - If a new employer never seen before: add an `EMPLOYER_CHANGE` alert and ask the user.
4. **Extract the key data**:
   - Period start/end (payslip date format → ISO)
   - Payment date ("Paiement par virement le …" or "Date et Mode de paiement")
   - **Gross**, **Taxable net**, **Net social**, **Net payable before income tax**, **Net payable**, **WHT withheld**, **WHT rate**
   - Year-to-date amounts (the "Année" or "Cumulé sur l'année" line): gross, taxable net, WHT
   - Hours worked
5. **Detect special items** (lines outside the base salary):
   - One-off bonuses ("Prime de fin d'année", "Prime sur régularisation")
   - Paid-leave indemnity / end-of-contract indemnity
   - Profit-sharing / participation (with a invested/paid note)
   - For each item: label, amount, income-tax impact
6. **Detect alerts**:
   - **Departure date filled in** or presence of paid-leave indemnity year N/N-1 → `FINAL_SETTLEMENT_PAYSLIP` (critical) + file suffix `_solde`
   - Period < a full month → `PAYSLIP_PARTIAL` (warning)
   - WHT = 0 and taxable net > 0 → `WHT_ZERO_WITH_INCOME` (info, normal for a low household marginal rate)
   - WHT rate ≠ previous month's rate → `WHT_RATE_CHANGE` (info)
   - Presence of one-off bonuses → `EXCEPTIONAL_BONUS` (info)
   - Profit-sharing/participation **invested** → `PROFIT_SHARING_INVESTED` (info, not taxable)
   - Profit-sharing/participation **paid to a bank account** → `PROFIT_SHARING_PAID` (warning, potentially taxable beyond the cap)
   - New employer never seen this year for this person → `EMPLOYER_CHANGE` (warning)
   - Current payslip year-to-date - previous payslip year-to-date ≠ current-month amounts → `CUMULATIVE_VS_MONTH_GAP` (critical)
7. **Detect missing payslips**:
   - Payslip year-to-date gross / typical monthly gross → estimate the number of months included in the year-to-date
   - If > number of payslips already processed for this person this year → `PAYSLIP_MISSING` alert (critical) on this fiche, listing the probable missing months.
8. **Write the YAML fiche**:
   - Name: `YYYY-MM_<employer-slug>[_solde].yaml` (month = month of the period end date)
   - Place it in `income-tax/payslips/YYYY/<person_key>/` (create the folder if needed)
9. **Move and rename the source PDF** side by side with the YAML, with the same base name.

### Step 5 — Update the index

Once all documents have been processed, regenerate `_index.yaml`:

```bash
python3 $SKILL_DIR/build_index.py
```

The script:
- Walks all YAMLs under `YYYY/<person>/`
- Computes per year × person: total gross, total taxable net, total WHT, months covered, detected missing payslips
- Computes the **household totals** per year (sum of taxable net of all members → global income-tax box)
- Lists the fiches with critical alerts

### Step 6 — YAML validation (mandatory)

Validate the new fiches + the index against the formal schemas:

```bash
accountant verify --workspace $WORKSPACE --type payslip
accountant verify --workspace $WORKSPACE --type payslips_index
```

If a schema error appears, fix the offending fiche before continuing. The runner also runs in CI via `.github/workflows/verify-yaml.yml` on every push.

### Step 7 — Report

Give a sober recap:
- Number of new fiches produced
- For each person × year: total taxable net + number of payslips
- Detected missing payslips (to recover from the employer)
- Critical alerts (final-settlement payslips, year-to-date gaps)

## Workspace-specific rules

### Person → canonical key mapping

The household member list and their canonical `person_key` values are defined in your workspace **PROJET.md** (loaded during bootstrap). Use those keys for folder paths (`YYYY/<person_key>/`) and YAML fields.

Any unrecognized name on a payslip → ask the user to map it before filing.

### Known employers

Known employer slugs are defined in **PROJET.md**. Convention: kebab-case (lowercase, spaces → hyphens).

Any employer absent from PROJET.md → `EMPLOYER_CHANGE` alert + ask the user.

### Tax year in France

Income is taxable for the year it is **made available** (≈ payment date). In practice for payslips:
- Payslip 01/12/2025 → 31/12/2025 paid 31/12/2025 → `fiscal_year: 2025`
- Payslip 01/01/2026 → 31/01/2026 paid 31/01/2026 → `fiscal_year: 2026`

Exception "January salary catch-up" paid in December N-1 = taxable in N-1 but in practice not observed in this file.

### Income-tax return boxes (quick reference)

The `_index.yaml` directly provides the values to report. Replace `<person_key_N>` with the keys defined in PROJET.md:

| Return box | Source in the index |
|---|---|
| 1AJ (wages and salaries, taxpayer 1) | `years.<YYYY>.<person_key_1>.retained_tax_base` |
| 1BJ (wages and salaries, taxpayer 2) | `years.<YYYY>.<person_key_2>.retained_tax_base` |
| 8HV (withholding tax, taxpayer 1) | `years.<YYYY>.<person_key_1>.total_wht` |
| 8IV (withholding tax, taxpayer 2) | `years.<YYYY>.<person_key_2>.total_wht` |

**Note**: if the EURL manager is a TNS majority manager (Article 62 CGI), their management remuneration is NOT classic salaries and does not follow this payslip logic. It is declared separately (box 1GB or a dedicated TNS box).

### Special case: final-settlement payslip

The end-of-employment payslip (departure date filled in) contains several items to isolate:
- Paid-leave indemnity year N + paid-leave indemnity year N-1
- Prime sur régularisation
- Balance of half-days
- 10th-base top-ups N / N-1

All these amounts are taxable in the year they are paid (except severance pay, not applicable here as resignation/mutual termination is not documented).

Always produce this payslip with the `_solde` suffix and a critical `FINAL_SETTLEMENT_PAYSLIP` alert.

### Missing-payslip detection

The annual year-to-date printed on each payslip lets you detect gaps:
1. Sort a person's payslips for a year by date.
2. For each payslip, check that `year_to_date.taxable_net` of the current payslip ≈ `year_to_date.taxable_net` of the previous payslip + `monthly_amounts.taxable_net` of the current one.
3. If the gap > 5 €, either there is a data-entry error or a payslip is missing between the two. Raise a `PAYSLIP_MISSING` or `CUMULATIVE_VS_MONTH_GAP` alert.

If the first available payslip for a person in a given year shows a year-to-date that covers several months, the earlier payslips are missing — note them in the index's `missing_payslips`.

## Guardrails

- **Do not produce** a YAML fiche if a fiche already exists for this month × person × employer (check all `YYYY/` subfolders before processing). Otherwise: produce one with a `PAYSLIP_CORRECTION` alert (warning) and keep both.
- **Do not confuse** Taxable net and Net payable: it is the Taxable net that goes into the income-tax return.
- **Do not confuse** Taxable net and Net social: since 2023 the "Montant net social" is a different legal line, useful for social benefits but not for income tax.
- **WHT = 0** may be normal depending on the household's marginal rate (check PROJET.md). Raise `WHT_ZERO_WITH_INCOME` as `info` only — not `critical`.
- **Profit-sharing/participation invested** ≠ paid: only the amount paid to a bank account is potentially taxable beyond the cap (PASS).
- **YAML format**: avoid starting a list item with a quote `"..."` followed by other text (parse error). Either the whole string is quoted, or no quotes.
- **Explicit empty fields**: `null` or `[]` rather than omitting the field.

## See also

- `SCHEMA.md` — formal reference, bundled with this skill (`$SKILL_DIR/SCHEMA.md`)
- `build_index.py` — script that generates the annual index
- Skill `bootstrap-projet` — to run before this skill if the context is not loaded
- Memory `$MEMORY_DIR` — household profile + decisions
- Skill `justificatif-describe` — reference pattern (inbox + YAML + aggregated index)

## Skill maintenance

To be updated when:
- A new employer joins the household (update PROJET.md, not this skill)
- A new recurring special item appears
- The payslip format evolves (2026+ law)
- The composition of the tax household changes (3rd child June 2026, etc.)
