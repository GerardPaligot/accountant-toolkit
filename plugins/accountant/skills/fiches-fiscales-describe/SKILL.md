---
name: fiches-fiscales-describe
description: Use this skill to analyze new personal tax documents (income-tax notices, property-tax notices, pre-filled income-tax return, tax-credit advance letters) deposited at the root of `$WORKSPACE/income-tax/`. Detects the document type, produces a YAML fiche per the bundled `SCHEMA.md`, files it into the right subfolder (`tax-notices/`, `property-taxes/`, `pre-filled-returns/`, `credit-advances/`), and refreshes the top-level `_index.yaml`. Trigger when the user says « analyse mon avis d'impôt », « traite la pré-déclaration », « range les pièces fiscales », « lis l'avis de taxe foncière », or drops a DGFiP PDF in the income-tax folder.
---

# Skill — Analysis and sorting of personal tax documents

## Overview

A versatile skill that processes **4 types of personal tax documents** issued by the DGFiP for the Paligot household, deposited at the root of `income-tax/`:

1. **Income-tax notice** — issued in year N+1 on year-N income (PDF title: "Impôt sur les revenus de YYYY")
2. **Property-tax notice** — annual, arriving August-September
3. **Pre-filled income-tax return** — pre-declaration sent each spring
4. **Tax-credit advance** — January letter announcing the 60 % advance transfer

For each document: type detection → structured extraction → YAML compliant with `SCHEMA.md` → filing into the subfolder → update of the top-level `_index.yaml` index that consolidates the overall view by tax year.

**Out of scope**: payslips (dedicated skill `bulletin-salaire-describe`) and EURL accounting (skills `justificatif-describe`, `audit-accountant-paligot`).

## When to use

- The user deposits a DGFiP PDF at the root of `income-tax/`
- The user says: « analyse mon avis d'impôt », « range cette pièce fiscale », « traite la déclaration auto », « lis l'avis taxes foncières », « combien j'ai à payer cette année ? »
- Before answering a question about the household's income-tax return (cross-checking payslips + pre-filled return + notice)

## Procedure

### Step 1 — Bootstrap

If the conversation is new, run `bootstrap-projet` first to load the context (household profile, tax composition, memory).

### Step 2 — Inventory the inbox

```bash
cd $WORKSPACE/income-tax
ls *.pdf 2>/dev/null
```

The files at the root are the inbox. `_index.yaml` and the subfolders (`tax-notices/`, `property-taxes/`, `pre-filled-returns/`, `credit-advances/`, `payslips/`) stay in place.

### Step 3 — Load the schema

Read `$SKILL_DIR/SCHEMA.md` (the schema bundled with this skill) for a reminder of the common fields + type-specific fields + alert codes. **Every YAML fiche must strictly comply with the schema**.

### Step 4 — Detect the type of each PDF

Detection heuristics (in priority order, the first match wins):

| Clue in the PDF | Detected type |
|---|---|
| Title "Impôt sur les revenus de YYYY" + "Avis d'impôt établi en YYYY+1" + sections "Détail des revenus", "IMPOT NET" | `income-tax-notice` |
| Title "Taxes foncières pour YYYY" + "AVIS D'IMPÔTS LOCAUX" + sections "Propriétés bâties" | `property-tax` |
| Title "MA DÉCLARATION AUTOMATIQUE" + "la déclaration automatique comment ça marche ?" + sections "VOTRE FOYER", "VOS REVENUS ET CHARGES" | `pre-filled-return` |
| "Une avance, d'un montant de XXX €, sera versée le DD MMM YYYY" + "AVANCE CREDIMPOT" | `credit-advance` |

If none matches → ask the user before filing.

### Step 5 — For each document

1. **Read** the PDF with `Read`.
2. **Extract the common fields**:
   - `tax_household` (tax numbers, situation, parts, children)
   - `administrative_references` (notice reference, FIP number, center, dates)
3. **Extract the type-specific fields** depending on the type:
   - **income-tax-notice**: income per taxpayer, total net salaries, tax before/after credits, balance, reference tax income, rate, PER caps
   - **property-tax**: property, debtors, itemized taxes, total, due payment
   - **pre-filled-return**: pre-filled income per person and box, estimated tax, new WHT rate, items to complete
   - **credit-advance**: amount, transfer date, label, calculation basis, expected adjustment
4. **Detect alerts**:
   - **income-tax-notice**: `BALANCE_DUE` if balance > 0, `PAYMENT_SCHEDULE` if spread out, `FAMILY_QUOTIENT_CAP_ACTIVE` if the average rate ≪ the marginal rate, `PER_CAP_AVAILABLE` if > 5 000 €
   - **property-tax**: info alert on variation > 5 % compared to N-1, `PAYMENT_SCHEDULE` if monthly direct-debit not activated
   - **pre-filled-return**:
     - `EURL_INCOME_NOT_COUNTED` (critical) if Gérard has an EURL activity and the pre-declaration only mentions his salaries
     - `CESU_PAJE_EMPLOYER` (warning) if CESU-PAJE income detected (= employer household → tax credit to declare)
     - `EXEMPT_OVERTIME_HOURS` (info) if box 1HH/1IH is filled in
     - `TAX_CREDIT_TO_DECLARE` (warning) if the N-1 income-tax notice mentioned recurring credits (childcare, donations, home services) absent from the pre-filled return
     - `RETURN_TO_AMEND` (critical) if at least one alert above
     - `BALANCE_DUE` (info) if the remaining amount > 0
   - **credit-advance**: compare with the N-1 credits of the most recent income-tax notice and flag `ADVANCE_BELOW_CREDITS` (info) or `ADVANCE_ABOVE_CREDITS` (warning)
5. **Write the YAML** with the canonical name (see table below) and place it in the matching subfolder.
6. **Move the source PDF** side by side with the YAML.

### File naming convention

| Type | Subfolder | Convention |
|---|---|---|
| income-tax-notice | `tax-notices/` | `<income_year>_avis-ir.{pdf,yaml}` |
| property-tax | `property-taxes/` | `<tax_year>_taxes-foncieres.{pdf,yaml}` |
| pre-filled-return | `pre-filled-returns/` | `<income_year>_declaration-auto.{pdf,yaml}` |
| credit-advance | `credit-advances/` | `<transfer_year>_avance-credits.{pdf,yaml}` |

The year in the name is the one that makes the document **unique** in its subfolder (one document per year).

### Special case — Forward-looking estimates (`income-tax-estimate`)

The skill also produces a 5th type of fiche: the **forward-looking income-tax estimates**, created BEFORE the official return (e.g. in May 2026 to estimate the 2027 income tax on 2026 income).

| Characteristic | Detail |
|---|---|
| Schema | `.schemas/income-tax-estimate.schema.yaml` (separate from `tax-document`) |
| Subfolder | `income-tax/estimates/` |
| Convention | `<fiscal_year>_estimation.yaml` (e.g. `2026_estimation.yaml`) |
| Trigger | The user asks « estime mon IR de l'année prochaine », « combien je vais payer en 2027 ? », « projette mes impôts » |
| Specific fields | `income_assumptions`, `calculation`, `range` (low/central/high), `estimated_marginal_rate`, `recommendations`, `methodology_sources` |
| Human doc | Dedicated section in `$SKILL_DIR/SCHEMA.md` |
| No source PDF | This is a pure-Claude fiche, not a PDF to analyze |

Procedure for an estimate:
1. Identify the target tax year and the projected household (parts, family events).
2. Gather the income assumptions from the user (ideally via AskUserQuestion).
3. Apply the projected scale (revaluation +1 %/year if the Finance Act is not yet published).
4. Check the family-quotient cap (CGI art. 197-I-2°, cap ~1 800 €/half-part).
5. Compute the forward WHT according to the profile (employee = DGFiP rate / TNS art. 62 = 0 down-payment as long as no N-1 has been declared).
6. Produce the low/central/high range.
7. Write the YAML fiche + validate via `accountant verify --workspace $WORKSPACE --type income_tax_estimate`.

### Step 6 — Update the top-level index

Once all documents have been processed:

```bash
python3 $SKILL_DIR/build_index.py
```

The script:
- Walks the 4 subfolders (`tax-notices/`, `property-taxes/`, `pre-filled-returns/`, `credit-advances/`)
- Groups by year (each type has its own year logic — see SCHEMA)
- References the totals from `payslips/_index.yaml` (read-only)
- Produces `income-tax/_index.yaml` with a `years.<YYYY>` section grouping all the documents of that year + a `critical_alerts` aggregate

### Step 7 — YAML validation (mandatory)

Validate the new fiches + the index against the formal schemas:

```bash
accountant verify --workspace $WORKSPACE --type tax_document
accountant verify --workspace $WORKSPACE --type tax_documents_index
accountant verify --workspace $WORKSPACE --type income_tax_estimate   # if an estimate fiche was produced in this session
```

If a schema error appears, fix the offending fiche before continuing. The runner also runs in CI via `.github/workflows/verify-yaml.yml` on every push.

### Step 8 — Report

Give a sober recap:
- Number of new fiches produced per type
- Key points extracted (reference tax income, balance, property-tax amount, estimated tax)
- Critical alerts (missing EURL income, credits to declare, etc.)
- Recommended actions to take before the deadline (amend the return, payment, etc.)

## Rules specific to the Paligot household

### Tax-household composition (to be used for consistency)

- **Taxpayer 1**: Gérard Paligot (key `gerard`), born 05/10/1989 in Ixelles (Belgium), Belgian nationality, tax number `30 25 914 136 042`
- **Taxpayer 2**: Aurore Paligot, née LAMBRECHTS, born 13/07/1989 (place to be confirmed, BELGIQUE 99 on the pre-filled return), tax number `30 29 952 505 489`
- **Situation**: Married (M)
- **Dependent children 2024-2025**: 2 (born 2018 and 2020) → **3 parts**
- **Dependent children 2026**: 3 expected (3rd planned June 2026) → **4 parts** from 2026 on the 2026 income
- **Tax address**: 77 RUE DU ONZE NOVEMBRE 1918, 59491 VILLENEUVE D'ASCQ
- **Tax center**: SIP ROUBAIX, 35 av Charles Fourier, 59066 ROUBAIX CEDEX 1
- **Marginal rate 2024**: 30 % (taxable income 73 559 € → bracket 28 797-82 341 €)
- **Average rate 2024**: 5,97 %

### Special case 2025: Gérard's EURL income

Gérard started his EURL on 01/11/2025 and resigned from Decathlon on 14/11/2025. From 15/11/2025, his income is **no longer salaries** but **management remuneration** subject to **article 62 CGI** (TNS majority manager). This remuneration:
- Is taxable in the "Traitements et salaires" category (box 1GB on the 2042 return) but comes from another source
- Must be declared **manually** because the DGFiP does not (yet) have the items via DSN
- 2025 estimate: ~9 000 € (2 months × 4 500 € net, to confirm with the accountant)

→ Any pre-filled return for 2025 income must be **amended** to add this line. Raise critical `EURL_INCOME_NOT_COUNTED` and `RETURN_TO_AMEND`.

### Special case: Aurore's CESU-PAJE

The 2025 pre-filled return reveals that Aurore receives CESU-PAJE income from M. MARIANELLI KEVIN (1 243 €). This means Aurore **employs** that person via the declarative CESU (e.g. in-home childcare). Tax consequence:
- The CESU-PAJE income of 1 243 € is taxable on Aurore's side (box 1BA), automatically included
- But this opens a right to a **50 % home-services tax credit** on the amounts paid (CGI art. 199 sexdecies). If the household paid ~2 500 € to M. Marianelli over the year, the credit would be ~1 250 €.

→ Raise `CESU_PAJE_EMPLOYER` (warning) with a request for the exact amount paid, to be completed manually in the return.

### Special case: childcare for children under 6

The children being born in 2018 and 2020:
- In 2024: 6 years and 4 years → young-children childcare tax credit (< 7 years) eligible for the 2020 child. The 2024 income-tax notice shows a declared credit of 855 € → retained 428 € (probably capped).
- In 2025: 7 years and 5 years → only the 2020 child is eligible (< 7 years on 1 January 2025).
- In 2026: 8 years and 6 years → none eligible anymore for the "young children" credit. But the 3rd (June 2026) will be eligible from 2026 then 2027/2028/2029.

→ Always raise a `TAX_CREDIT_TO_DECLARE` warning if the N-1 notice showed a childcare credit and the N pre-filled return does not contain it (normal because these are declarative charges).

### Special case: jointly-owned property tax

The property at 77 rue du 11 novembre 1918 is in **joint ownership** (indivision) between Gérard and Aurore (see the 2025 notice: 2 debtors PROP/INDIVIS MF5QD8 and MF5QD7). Consequences:
- The property tax is owed jointly by the co-owners.
- If the EURL uses a share of the property for its registered office (see the make-available convention 6,50 % validated 2026-05-25 régime A), the 6,50 % share of the property tax can be **rebilled to the EURL** (corporate-tax-deductible charge) and is no longer deductible on the household side.

→ For 2025: 744 € total → EURL share = 744 € × 6,50 % = **48,36 €** rebillable. The remaining 695,64 € stays a personal charge.

## Guardrails

- **Do not produce** a fiche if a fiche of the same type/year already exists (check the subfolder first). If a new version (DGFiP correction), produce one with a `RECTIFICATION` warning and keep both.
- **Never invent** an unreadable amount — use `null` and raise a `RECEIPT_INCOMPLETE` alert.
- **IBAN, BIC, tax numbers**: reproduce the strings exactly as printed (with partial masking if the PDF carries it).
- **YAML format**: avoid starting a list item with a quote `"..."` followed by other text (parse error). Prefer no quotes.
- **Explicit empty fields**: `null` or `[]` rather than omission.

## See also

- `SCHEMA.md` — formal reference, bundled with this skill (`$SKILL_DIR/SCHEMA.md`)
- `build_index.py` — script that generates the top-level index
- Skill `bulletin-salaire-describe` — for payslips (separate schema)
- Skill `bootstrap-projet` — to run before this skill if the context is not loaded
- Memory `$MEMORY_DIR/impots_ir_setup.md`

## Skill maintenance

To be updated when:
- A new type of DGFiP document appears (e.g. CSG/CRDS wealth notice, IFI)
- The format of an existing document evolves on the DGFiP side (new box, new label)
- The household composition changes (3rd child June 2026, marriage, divorce, relocation)
- Gérard's TNS status evolves (switch to SAS, change of regime)
