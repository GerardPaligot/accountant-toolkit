---
name: dispatch-inbox
description: Use this skill when the user wants to triage and dispatch new documents deposited in the unified `inbox/` folder at the workspace root. Detects each file's type (receipt EURL, payslip, personal tax document), moves it to the right specialized skill's inbox, then invokes that skill to produce the YAML record. Trigger when the user says « trie l'inbox », « dispatch les nouveaux documents », « range cette inbox », « catégorise mes documents », « tri auto », « traite l'inbox », or runs `/dispatch-inbox`. Do NOT trigger when the user explicitly invokes a specific `*-describe` skill or drops files directly into a specialized inbox.
---

# Dispatching the unified inbox

## Overview

Orchestrator skill that handles the triage and analysis of a pile of heterogeneous documents dropped into `inbox/` at the workspace root. **No business extraction here**: this skill routes, the `*-describe` sub-skills do the analysis.

Pipeline: `inbox/foo.pdf` → type detection → move to the root of the target skill's inbox → invoke that skill → YAML record produced + final filing + `_index.yaml` update + validation.

## When to use

- The user has dropped several PDF/JPG files into `inbox/` and wants to process everything at once
- Explicit triggers: « trie l'inbox », « dispatch les nouveaux documents », « range cette inbox », « catégorise mes documents », « traite l'inbox », « /dispatch-inbox »

**Do not use for**:
- A single document whose type is obvious (the user can invoke `justificatif-describe`, `bulletin-salaire-describe`, or `fiches-fiscales-describe` directly)
- Documents already filed in the right inbox (nothing to dispatch)
- Types out of scope (Revolut statements, CA3, mileage notes, client invoices, accountant letters) — for now these types have no dedicated skill, handle them manually

## Procedure

### Step 1 — Bootstrap

If the session is fresh, run the `bootstrap-projet` skill to load PROJET.md + memory + workspace state. Otherwise, skip this step.

### Step 2 — Inventory of `inbox/`

List the files to process:

```bash
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/inbox/
```

**Scan scope**:
- Include: PDF, JPG, JPEG, PNG files **at the root** of `inbox/`
- Exclude: `_README.md`, `_unknown/` (subfolder), any other subfolder, any file starting with `_` or `.`

If the inbox is empty or contains only exclusions → announce "rien à dispatcher" and stop.

### Step 3 — Classification (one file at a time)

For each file to process, classify into one type among:

| Type | Target |
|---|---|
| `receipt` | Cash receipt, vendor invoice, merchant receipt — typically paid via the EURL card |
| `payslip` | Payslip of a member of the tax household (Gérard, Aurore) |
| `tax_document` | Personal DGFiP document (income-tax notice, property taxes, pre-filled return, credit advance) |
| `unknown` | The type fits none of the 3 above, OR several types are possible without certainty |

**Classification procedure** (in this order):

1. **Heuristic on the file name** — often enough:
   - Payslip keywords: `bulletin`, `paye`, `paie`, `salaire`, `BULLETIN_DE_PAIE`, `decathlon`, `intrepides`, `W_BULLETIN`
   - Tax document keywords: `avis_d_impot`, `Avis_d_impot`, `avis_de_taxes`, `taxes_foncieres`, `declaration_automatique`, `Avance_de_reductions`, `AVANCE_CREDIMPOT`, `impot_sur_les_revenus`
   - If no reliable keyword → go to step 2

2. **Read the 1st page of the PDF** (via the Read tool on the `.pdf` file, which renders the page visually):
   - **Payslip**: header with the employer's legal name + SIREN, presence of the lines « Salaire Brut », « Net imposable », « Net social », « Net à payer », « Prélèvement à la source »; period at the top (du JJ/MM au JJ/MM)
   - **DGFiP tax document**: « République Française » mark / « Direction générale des Finances publiques » / Marianne logo; document title: « Avis d'impôt », « Avis de taxes foncières », « Déclaration automatique », « Avance de réductions et crédits d'impôt »
   - **Receipt**: everything else — cash receipt, vendor invoice, merchant receipt. Characteristics: presence of a non-DGFiP SIRET number, TTC/HT/TVA amounts, line-item labels, transaction date

3. **In case of persistent doubt between 2 types** → mark `unknown` (do not guess). The doubt costs less than a wrong route.

4. **If the file is a tax-document sub-type**, keep track of which one (`income-tax-notice | property-tax | pre-filled-return | credit-advance`) — useful for the report, but the `fiches-fiscales-describe` sub-skill re-detects it anyway.

### Step 4 — Routing plan + confirmation

Present a recap table to the user:

```
Plan de routage (N fichiers) :

  Fichier                                         Type détecté      Destination
  ─────────────────────────────────────────────  ────────────────  ───────────────────────────────
  match_20260601_502024200612.pdf                 receipt           receipts/
  W_BULLETIN_DE_PAIE_MAI_2025_PALIGOT.pdf         payslip           income-tax/payslips/
  Declaration_automatique_2025.pdf                tax_document      income-tax/
  ─────────────────────────────────────────────  ────────────────  ───────────────────────────────
  doc_scan_anonyme.pdf                            unknown           inbox/_unknown/

Confirmer pour déplacer les fichiers et lancer les sous-skills (oui / corriger) ?
```

**Wait for explicit confirmation** before moving anything. If the user wants to correct a type, take their decision and re-confirm.

### Step 5 — Moves

For each confirmed file:

| Type | Command |
|---|---|
| `receipt` | `mv inbox/<file> receipts/<file>` |
| `payslip` | `mv inbox/<file> income-tax/payslips/<file>` |
| `tax_document` | `mv inbox/<file> income-tax/<file>` |
| `unknown` | `mkdir -p inbox/_unknown && mv inbox/<file> inbox/_unknown/<file>` |

**Anti-overwrite safeguard**: before each `mv`, check that no file with the same name exists at the destination (`test -e <dest>`). If so, **do not move**, keep it in `inbox/`, note it in the report ("doublon : <fichier> existe déjà à <chemin>").

### Step 6 — Sequential invocation of the sub-skills

For each inbox that received at least one file, invoke the corresponding skill **in order**:

1. If at least 1 `receipt` moved → invoke `justificatif-describe`
2. If at least 1 `payslip` moved → invoke `bulletin-salaire-describe`
3. If at least 1 `tax_document` moved → invoke `fiches-fiscales-describe`

Each sub-skill follows its own procedure (extraction, YAML, final filing in `YYYY-MM/` or `YYYY/<person>/` or `<subfolder>/`, `_index.yaml` update, validation `verify.py --type ...`).

**Do not parallelize**: sequential only, so that each skill finishes cleanly (index update) before the next starts. Also: only one `_index.yaml` modified at a time.

### Step 7 — Global validation

After all the sub-skills, run a full run to confirm consistency:

```bash
cd /Users/gpaligot/Documents/ai-agents/expert-accountant
python3 .script/verify.py
```

Should display « N fichier(s) validé(s), 0 erreur ». If error → flag it in the report and invite Gérard to fix it.

### Step 8 — Report

Final structured recap:

```
✅ Dispatch terminé.

  Justificatifs       : N nouvelle(s) fiche(s) → receipts/YYYY-MM/
  Bulletins de salaire: N nouvelle(s) fiche(s) → income-tax/payslips/YYYY/<personne>/
  Fiches fiscales     : N nouvelle(s) fiche(s) → income-tax/<type>/

  Doublons non traités: <liste si applicable>
  Unknowns en attente : inbox/_unknown/ (N fichier(s))

  Validation YAML     : <résultat de verify.py>
```

## Classification rules — patterns known from the Paligot file

To speed up case-by-case detection:

### Usual merchants → `receipt`
- Picard Surgelés, Match (supermarché Villeneuve d'Ascq), Ferme du Sart (Otera), Amazon, Apple, Ubiquiti, MYCS, Alan, L-Expert-Accountant, Tiime, EasyPark, StartFabrik

### Usual employers → `payslip`
- **Decathlon** → Gérard's payslip (up to and including 14/11/2025, then no more payslip since Gérard is TNS as of 15/11/2025)
- **Les Intrépides** → Aurore's payslip (services à la personne, ongoing)
- Any other new employer → ask Gérard whether Aurore or Gérard is concerned

### DGFiP signs → `tax_document`
- Header « République Française » + Marianne
- Mention « Direction générale des Finances publiques »
- Footer « impots.gouv.fr »
- Notice reference in the format `25 59 0120257 24` or similar
- Tax number in the format `30 25 914 136 042` (Gérard) or `30 29 952 505 489` (Aurore)

### Ambiguous cases to arbitrate
- **L-Expert-Accountant invoice** → `receipt` (EURL expense — accounting fees), NOT a tax document.
- **Tiime Software invoice** → `receipt` (EURL expense — software subscription).
- **Picard receipt with a « Madame Paligot » mention** → always `receipt` (the business/personal use arbitration is done in the YAML by `justificatif-describe`).

## Safeguards

- **NEVER** move a file without explicit confirmation from Gérard on the routing plan (Step 4).
- **NEVER** overwrite an existing file at the destination — keep it in `inbox/` and flag it.
- **NEVER** modify the PDF/JPG files (read-only for the Read tool).
- **Do NOT guess**: in case of doubt, mark `unknown` and let Gérard arbitrate later.
- **Do not parallelize** the sub-skills — otherwise the `_index.yaml` files may step on each other.
- **If the inbox contains > 30 files**, do a mini-batch (10 files max) and re-ask for confirmation between each batch — classification cost is reasonable, but mostly for readability.

## See also

- `inbox/_README.md` — human doc for the inbox
- Skills called downstream:
  - `justificatif-describe` — for EURL receipts
  - `bulletin-salaire-describe` — for the household payslips
  - `fiches-fiscales-describe` — for personal DGFiP documents
- `bootstrap-projet` — loaded at the start of the session if needed
- `.script/verify.py` — final YAML validation (already triggered by each sub-skill, re-checked globally at step 7)

## Skill maintenance

Update when:
- A new recurring document type is added to the workspace (auto-processed Revolut statements, etc.) → add a classification branch + a new `*-describe` sub-skill
- A new employer appears for the payslips (Aurore changing jobs, or Gérard taking up salaried employment one day) → add it to the "Usual employers" table
- The batch threshold (30 files) needs adjusting
- The naming convention of the `inbox/` folder changes (unlikely)
