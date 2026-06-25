---
name: enrich-justificatifs
description: Use this skill to enrich existing receipt YAML records with complementary information from Gérard. Scans the records in `$WORKSPACE/receipts/YYYY-MM/` for open warnings, critical alerts, and `info_to_complete` items, asks Gérard targeted questions grouped by theme, updates the YAML files (filling fields, removing resolved alerts, upgrading conditional corporate-tax status to definitive when possible), and refreshes `_index.yaml`. Trigger when the user says "complète les justificatifs", "enrichis les fiches", "réponds aux questions ouvertes", or "résous les warnings".
---

# Skill — Enriching receipt records with user-provided information

## Overview

Companion skill to `justificatif-describe`. Once the initial analysis is produced (extraction from the document), many records remain in conditional status because **declarative** elements are missing: the name of the guest at a meal, the purpose of a trip, the status of a DDG reimbursement, the actual business use of a piece of equipment, etc. This skill scans those gaps, groups the questions by theme, asks Gérard, and updates the records + the index.

## When to use

- The user explicitly asks: "complète les fiches", "enrichis les justificatifs", "réponds aux warnings", "apporte les infos complémentaires"
- Before an audit or a handover to the accountant, to reduce the number of documents in conditional status
- After adding a batch of new records via `justificatif-describe`

**Do not use to**: modify fields extracted from the document (amounts, dates, line items). Those fields are not corrected through enrichment — either fix the record manually, or re-run `justificatif-describe` on the document.

## Procedure

### Step 1 — Bootstrap

If the context is not loaded, run the `bootstrap-projet` skill.

### Step 2 — Gap scan

Run the scan script:

```bash
python3 $SKILL_DIR/scan_gaps.py
```

The script produces a report on stdout: number of records with gaps, grouping by theme, examples. The standard themes are:

| Theme | Detected pattern | Typical question |
|---|---|---|
| `client-meal` | `RECEIPT_INCOMPLETE` + `business_context.guest: null` on a restaurant | Who was the guest, their company, the purpose of the meal? |
| `travel-purpose` | `RECEIPT_INCOMPLETE` on a trip (parking, hotel, transport) | What was the purpose of the trip to [city]? |
| `iceland-trip-double-reimb` | `POSSIBLE_DOUBLE_BILLING` (Mozza CDG, SSP Iceland) | Did DDG separately reimburse the food expenses of the trip? |
| `equipment-usage` | `RECEIPT_INCOMPLETE` on unusual IT equipment (audio, accessories) | What is the business use of the Focusrite / KVM Switch / etc.? |
| `supplies-personal-suspect` | `LIKELY_PERSONAL_PURPOSE` (Faber-Castell, Maped, etc.) | Actual business use or cumulative withdrawal? |
| `coffee-mrs-paligot` | Match receipts under the name Madame Paligot | Which office vs. personal share to apply? |
| `taxpayer-position-otera-sunday` | Otera Sunday pattern | Keep the position or drop it? |
| `corrected-invoice-pending` | Critical `RECEIPT_INCOMPLETE` on Odyssée / MYCS | Request sent? Status of the correction? |
| `personal-payment` | `PERSONAL_PAYMENT` info | CCA 4551 rebilling done? |
| `duplicate-to-confirm` | Critical `RECEIPT_PARTIAL` with the word DOUBLON | Confirm that only one entry was made in Tiime |

### Step 3 — Presentation to the user

Present a structured recap:

```
J'ai identifié X fiches avec questions ouvertes, réparties en N thèmes :

  • [12] client-meal (Breton et Fils, Ch'ti Charivari, PlanetSushi ×3)
  • [4]  travel-purpose (EasyPark Lille ×2, Molenbeek, Tortilla Paris)
  • [3]  iceland-trip-double-reimb (Mozza CDG ×2, SSP Iceland)
  • ...

Par quel thème veux-tu commencer ?
```

Offer the themes via `AskUserQuestion` or free conversation. Always let Gérard choose the order.

### Step 4 — Asking questions per thematic batch

For each selected theme, process the records in series:

1. **Announce the record**: "Fiche `breton_et_fils_20260122` — Repas Tartatou du 22/01 à 21h49, 31,10 € TTC, 5 articles type bistrot."
2. **Present what is missing**: cite the items from `info_to_complete`.
3. **Ask the questions**:
   - For structured questions (yes/no, choice between options) → use `AskUserQuestion`
   - For open questions (guest name, trip purpose) → ask in conversation
4. **Capture the answer** verbatim.
5. **Update the YAML record**:
   - Fill the relevant fields (`business_context.guest`, `business_context.reason`, etc.)
   - Remove the resolved `info_to_complete` items
   - Remove the resolved `alerts`
   - Add an `additional_information` block with date + notes + resolutions
   - If relevant, switch `tax_analysis.corporate_tax_deductibility.status` from `conditional` to `yes` and update the reason
   - Update the `summary` if the enrichment changes the meaning
6. **Confirm to Gérard**: "Fiche mise à jour. Statut IS : conditionnelle → oui. Alertes restantes : 0."

### Step 5 — Index update

Once the batch is finished (or midway through if Gérard asks for a break):

```bash
python3 $SKILL_DIR/../justificatif-describe/build_index.py
```

### Step 6 — YAML validation (mandatory)

Validate the updated records + the index against the formal schemas:

```bash
accountant verify --workspace $WORKSPACE --type receipt
accountant verify --workspace $WORKSPACE --type receipts_index
```

If a schema error appears, fix the offending record before continuing. The runner is also executed in CI via `.github/workflows/verify-yaml.yml` on every push.

### Step 7 — Final report

Short recap:
- Number of records enriched
- Corporate-tax statuses upgraded (conditional → yes)
- Remaining critical alerts
- Questions still open (that Gérard could not decide in this session)

## YAML update rules

### A. Updating a client meal

When Gérard provides name + company + purpose:

```yaml
# Before
business_context:
  business_link: Repas client
  guest: null
  reason: null

# After
business_context:
  business_link: Repas client
  guest: "Jean Dupont (CEO Acme Corp)"
  reason: "Prospection nouvelle mission Q2 2026"

additional_information:
  completion_date: 2026-05-14
  provided_by: Gérard Paligot
  notes:
    - "Invité : Jean Dupont, CEO Acme Corp"
    - "Objet : prospection nouvelle mission Q2 2026"
  resolutions:
    - alert_code: RECEIPT_INCOMPLETE
      resolution: "Invité et objet documentés → alerte levée"
      previous_corporate_tax_status: conditional
      new_corporate_tax_status: yes
```

And remove the `RECEIPT_INCOMPLETE` alert from the `alerts` array + the relevant items from `info_to_complete`. Update `tax_analysis.corporate_tax_deductibility.status` to `yes` and `reason` to reflect the resolution.

### B. Updating a trip purpose

Same as A but on `business_context.reason`.

### C. Iceland trip / double reimbursement

If Gérard confirms "DDG did not reimburse separately":
- Remove the `POSSIBLE_DOUBLE_BILLING` alert
- Corporate-tax status stays `yes` or moves to `yes` if `conditional`
- Record in `additional_information.notes`: "Confirmation DDG : pas de double remboursement"
- Apply to the 3-4 records of the trip simultaneously (Mozza CDG 19/04, Mozza CDG 24/04, SSP Iceland 24/04, and the mileage note for the Roissy round trip if relevant)

### D. Confirmed duplicate not booked

If Gérard confirms "checked in Tiime, only one entry":
- Keep the `RECEIPT_PARTIAL` alert but its severity may move from `critical` to `info`
- Record in `additional_information.notes`: "Confirmation Tiime : doublon non comptabilisé, une seule ligne saisie"
- Corporate-tax status stays `no` (consistent with the fact that it is a non-booked duplicate)

### E. Match coffee share — Madame Paligot

If Gérard rules "50 % office / 50 % personal":
- Record in `additional_information.notes`: "Quote-part bureau retenue : 50 %"
- Mentally adjust the deductible amount (the YAML may keep the total amount, but the corporate-tax reason must be updated)
- No automatic alert removal — this is a taxpayer decision.

### F. Suspect supplies (Faber-Castell, Maped kids)

Two possible resolutions:
- **Removal**: Gérard decides to remove the expense → add an info alert "EXPENSE_REMOVED" + corporate-tax status = `no` + explanatory note
- **Keep**: Gérard documents the actual business use → `business_context.reason` filled + `LIKELY_PERSONAL_PURPOSE` alert removed if conviction is strong, kept as `info` otherwise

### G. Corrected invoice (Odyssée, MYCS)

Three possible states:
- Request sent, pending → keep the critical alert, add a dated note
- Received, compliant → update the merchant/client identity fields, remove the alert, corporate-tax status possibly upgraded
- Vendor refusal → corporate-tax status definitively `no`, info alert "INVOICE_NOT_CORRECTED_REFUSAL"

## Safeguards

- **Never invent** information on Gérard's behalf. If a question stays without a clear answer, **leave the field empty** and keep the alert.
- **Preserve history**: never delete the trace of a previous enrichment. If Gérard wants to correct information he already gave, add a new entry in `additional_information.notes` rather than replacing the old one.
- **Do not modify extraction fields** (`merchant`, `document`, `amounts`, `nature.details`). These fields reflect the document as it is; they are not "completed".
- **Check consistency before commit**: if corporate-tax is upgraded from `conditional` to `yes`, the `reason` must be rewritten to no longer mention the resolved condition.
- **Index must be regenerated** at the end of the session — otherwise the global figures become wrong.

## Scripts shipped with the skill

- `scan_gaps.py`: analyzes all the YAML records, identifies the gaps and produces a report grouped by theme (stdout)
- `apply_update.py`: helper to apply a structured update to a record (input via stdin YAML), with backward compatibility and formatting preservation

## See also

- Skill `justificatif-describe` — to create the initial records from the raw documents
- Skill `bootstrap-projet` — to run before this skill if the context is not loaded
- `SCHEMA.md` — formal reference, notably the `additional_information` block. Bundled with the `justificatif-describe` skill (`$SKILL_DIR/../justificatif-describe/SCHEMA.md`)
- Memory `audit_decisions_2026-05.md` — decisions already settled (do not reopen them without a new signal)

## Skill maintenance

Update when:
- A new gap theme emerges (e.g. new expense pattern not covered by the theme table)
- A resolution rule changes (e.g. accountant decision on AN nourriture that resolves 30 Picard/Otera records at once)
- The SCHEMA evolves (new field or new alert code)
