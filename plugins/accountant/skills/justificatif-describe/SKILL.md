---
name: justificatif-describe
description: Use this skill to analyze new accounting receipts/invoices (justificatifs) deposited at the root of `$WORKSPACE/receipts/`. Produces a structured YAML fiche per the bundled `SCHEMA.md`, files it into the monthly subfolder `YYYY-MM/`, and refreshes `_index.yaml`. Trigger when the user says « analyse les nouveaux justificatifs », « traite les justificatifs », or drops files in the receipts folder.
---

# Skill — Structured analysis and description of receipts

## Overview

Skill to process new accounting receipts (cash receipts, invoices, receipts) deposited at the root of the `receipts/` folder. Produces a YAML fiche compliant with `SCHEMA.md`, then files the document into the monthly subfolder `YYYY-MM/`.

## When to use

- The user deposits one or more new PDF/JPG files in `$WORKSPACE/receipts/` (root = inbox)
- The user explicitly asks: « analyse les justificatifs », « traite les nouveaux tickets », « décris cette facture »
- Before an accounting audit, to fill in the documents that have not been analyzed yet

**Do not use for**: DDG client invoices (`factures/` folder), local-premises expenses (`frais-locaux/` folder), mileage expense reports (`expense/` folder). These folders have their own logic.

## Procedure

### Step 1 — Bootstrap

If the conversation is new, run the `bootstrap-projet` skill first to load the context (EURL profile, settled decisions, memory).

### Step 2 — Inventory the inbox

```bash
cd $WORKSPACE/receipts
ls *.pdf *.jpg *.jpeg 2>/dev/null
```

The files at the root (PDF/JPG/JPEG) are the inbox to process. The `.xlsx` files (Tiime exports) and any `.md` files stay at the root — do not touch them.

### Step 3 — Load the schema

Read `$SKILL_DIR/SCHEMA.md` (the schema bundled with this skill) for a reminder of the fields, allowed values, and alert codes. **Every fiche must strictly comply with the schema**.

### Step 4 — For each receipt

1. **Read** the document with `Read` (Claude reads PDF/JPG/JPEG directly).
2. **Extract** the factual information: merchant, SIRET, VAT number, date, amounts excl./incl. VAT, line items, payment method.
3. **Cross-check** against the project context:
   - Check the `audit_decisions_2026-05.md` memory for settled decisions (Picard, Otera, client meal, Iceland trip, etc.) — cite the position in the `prior_decision` block.
   - Check `convention_locaux_decision.md` if the document concerns the registered-office/home premises.
   - Check `remuneration_strategy.md` if the document relates to remuneration.
4. **Analyze deductibility**:
   - **Corporate tax**: yes / no / conditional (with reason + BOFiP/CGI references).
   - **VAT**: yes / no / not-applicable (with reason).
   - **Suggested GL account** (see table below).
   - **Fixed asset** if net excl. VAT > 500 €.
5. **Flag the alerts** (codes from the SCHEMA: `LIKELY_PERSONAL_PURPOSE`, `TAXPAYER_POSITION`, `EU_REVERSE_CHARGE_REQUIRED`, `RECEIPT_INCOMPLETE`, `RECEIPT_PARTIAL`, `FOREIGN_VAT_NON_DEDUCTIBLE`, `POSSIBLE_DOUBLE_BILLING`, `FIXED_ASSET_THRESHOLD`, `PERSONAL_PAYMENT`).
6. **Write** the YAML fiche with the **same base name** as the source document but a `.yaml` extension (e.g. `amazon_20260103_xxx.pdf` → `amazon_20260103_xxx.yaml`).
7. **Move** source + YAML into the `YYYY-MM/` subfolder matching the **document date** (not the processing date). If the subfolder does not exist, create it.

### Step 5 — Update the index

Once all documents have been processed, regenerate `_index.yaml` with the Python script:

```bash
python3 $SKILL_DIR/build_index.py
```

(`build_index.py` is co-located with this SKILL.md in the plugin. `ACCOUNTANT_WORKSPACE` must be exported — the bootstrap step does this.)

### Step 6 — YAML validation (mandatory)

Before the report, validate the new fiches + the index against the formal schemas:

```bash
cd $WORKSPACE
python3 .script/verify.py --type receipt
python3 .script/verify.py --type receipts_index
```

If a schema error appears, fix the offending fiche before continuing. The runner also runs in CI via `.github/workflows/verify-yaml.yml` on every push.

### Step 7 — Report

Give a sober recap:
- Number of new fiches produced
- Total incl. VAT / recoverable VAT for the batch
- Critical alerts encountered (to validate with the accountant)
- Possible duplicates (NOT to be booked in Tiime)

## Rules specific to the Gérard Paligot EURL file

### Already-settled patterns (do NOT re-flag unless something is new)

| Pattern | Settled position | Source |
|---|---|---|
| Client meal (PlanetSushi, Breton et Fils, Ch'ti Charivari) | OK if guest name + purpose documented | audit_decisions_2026-05.md |
| Groceries Picard / Otera / Match / Plaisirs et Gourmandises classified as "RESTAURANT" | Taxpayer position maintained; alert `TAXPAYER_POSITION`. Meal-allowance ("AN nourriture") scheme pending accountant validation | audit_decisions_2026-05.md |
| Iceland trip April 2026 | Deductible subject to no double DDG reimbursement (open question) | audit_decisions_2026-05.md |
| Odyssée works 729 € | Deductible if convention signed + invoice specifying the room **and** invoice in the EURL's name | audit_decisions_2026-05.md + Odyssée fiche |
| Apple iPad stylus / Amazon equipment | Reclassify to 606800 (not LOCATIONS DIVERSES) | audit_decisions_2026-05.md |
| StartFabrik furniture | Direct expense defensible if net excl. VAT < 500 € (the audit recommended a fixed asset but net excl. VAT = 381,90 €) | StartFabrik fiche |

### Amazon marketplace patterns

- **Sold by Amazon EU Succursale Française VAT FR12487773327** → direct FR sale, classic deductible French VAT.
- **VAT declared by Amazon EU LU20260743 (marketplace facilitator)** → third-party EU or non-EU seller, but French VAT collected by Amazon. **No EU reverse charge**, classic deductible.
- **VAT charged via OSS Guichet Unique** → same, classic deductible.

### E-commerce pattern outside marketplace facilitator

- **StartFabrik (DE)**: a REAL B2B intra-Community acquisition → EU reverse charge required (if the customer's intra-Community VAT number is provided).
- **MYCS (PL) via Viva Payments (GR)**: a payment receipt ≠ an accounting invoice. Recover the real MYCS invoice before booking.
- **Spain / Italy / etc. seller with OSS**: French VAT collected via OSS, no reverse charge.

### General chart of accounts (GL) — suggested accounts

| Category | Account | Label |
|---|---|---|
| Restaurant — client meal | 625710 | Réceptions, frais de représentation |
| Restaurant — individual meal | 625610 | Frais de repas |
| Food (Picard, Otera, etc.) | 625610 (or 644100 if AN nourriture) | Frais de repas ou AN nourriture |
| IT equipment < 500 € excl. VAT | 606800 | Fournitures non stockables — autres matériels |
| Furniture > 500 € excl. VAT | 218400 | Mobilier (immobilisation, 5-10 ans) |
| Furniture ≤ 500 € excl. VAT | 606400 | Fournitures administratives |
| Office supplies | 606400 | Fournitures administratives |
| SaaS software / subscription | 651600 | Droits d'utilisation logiciels |
| Accounting fees | 622600 | Honoraires |
| Travel — transport | 625100 | Voyages et déplacements |
| Travel — accommodation | 625100 | Voyages et déplacements |
| Parking | 625100 | Voyages et déplacements |
| Company formation costs | 622600 (or 201100 fixed asset 5 years) | Honoraires ou Frais établissement |

### EURL intra-Community VAT number

**FR26992805804** — to be mentioned in the merchant references if the document carries it.

## Guardrails

- **Do not push up** to PROJET.md or memory the one-shot details of a particular receipt — they stay in the YAML (see the `scope_des_documents_globaux` memory).
- **Do not create** a YAML fiche if a fiche already exists for the same source file (check all `YYYY-MM` subfolders before processing).
- **Known duplicates**: if the document appears to be a duplicate of another already-filed one (same ticket number, same hash, same amount), create a fiche with a critical-severity `RECEIPT_PARTIAL` alert and an explicit message "DOUBLON CONFIRMÉ avec [other file]". Do NOT delete the physical file — the Tiime audit determines which line is booked.
- **YAML format**: avoid starting a list item with a quote `"..."` followed by other text (causes parsing errors). Either the whole string is quoted, or no quotes at all.
- **Explicit empty fields**: `null` or `[]` rather than omitting the field — confirmed user preference.

## See also

- `SCHEMA.md` — formal reference for the YAML format, bundled with this skill (`$SKILL_DIR/SCHEMA.md`)
- Memory `$MEMORY_DIR` — settled decisions, organization, scope of docs
- Skill `bootstrap-projet` — to run before this skill if the context is not yet loaded
- Global skill `audit-accountant-paligot` — for cross-cutting accounting audits (this skill focuses on document-by-document processing)

## Skill maintenance

To be updated when:
- A new alert code is added to the SCHEMA
- A new expense category appears in the workspace
- A fiscal pattern is settled collectively (update the "Already-settled patterns" table)
