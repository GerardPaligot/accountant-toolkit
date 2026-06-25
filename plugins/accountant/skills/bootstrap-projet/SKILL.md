---
name: bootstrap-projet
description: Use when starting a new conversation in the expert-accountant workspace (/Users/gpaligot/Documents/ai-agents/expert-accountant/) or whenever Claude needs to refresh its context about Gérard Paligot EURL's accounting/fiscal situation. Reads PROJET.md, scans workspace folders to detect new files, loads memory directory, and produces a state summary before any other action.
---

# Project bootstrap — Gérard Paligot EURL accounting

## Overview

Skill to bootstrap a conversation in the `expert-accountant/` workspace. It loads the full project state (company profile, settled decisions, open questions, document inventory) in a minimal number of steps, and tells the user what has changed since the last session.

## When to use

- **Always** at the start of a new Claude conversation in `/Users/gpaligot/Documents/ai-agents/expert-accountant/`
- When the user asks « où en est-on ? », « quel est l'état du projet ? », « qu'est-ce qu'on doit faire en priorité ? »
- Before any audit, fiscal analysis, or drafting of a note for the accountant
- When Claude's memory is suspected to be stale (e.g. after a long interruption)

**Do not use for**: one-off technical tasks in other workspaces, general French-tax questions unrelated to this EURL.

## Bootstrap procedure (run in order)

### Step 1 — Load the memory index
Read `/Users/gpaligot/.claude/projects/-Users-gpaligot-Documents-ai-agents-expert-accountant/memory/MEMORY.md`, then the linked files in order:
1. `user_profile.md`
2. `project_workspace.md`
3. `remuneration_strategy.md`
4. `audit_decisions_2026-05.md`
5. `convention_locaux_decision.md`
6. Any other `*.md` file present

### Step 2 — Load the meta document
Read `/Users/gpaligot/Documents/ai-agents/expert-accountant/PROJET.md` which consolidates:
- Company profile (constants)
- Document inventory
- Settled decisions
- Open questions
- Glossary

This file is **the project source of truth**. If any info there contradicts the memory, PROJET.md wins (it is updated manually by the user).

### Step 2b — Load the accountant index (ongoing topics with L-expert-accountant.com)
Read `/Users/gpaligot/Documents/ai-agents/expert-accountant/accountant/_index.yaml` to immediately get the list of open accountant topics, their status (draft, sent, reply-received, resolved) and the upcoming deadlines. This file replaces the old flat tracking of `note-cabinet-*.md` at the root.

When the user asks « où en est-on avec le cabinet ? », « quelle réponse attend-on ? », « quoi à confirmer ? », this is the first source to consult before PROJET.md.

If the session involves updating an accountant topic (sending an email, receiving a reply), also read `accountant/SCHEMA.md` to stay conformant with the `_sujet.yaml` schema.

### Step 2c — (optional) Load the meta-docs index
Read `/Users/gpaligot/Documents/ai-agents/expert-accountant/_meta_docs.yaml` if the session involves:
- Modifying the structure of a meta document (`_tiime_*`, `_revolut_*`, `_index.yaml`, `SCHEMA.md`, `accountant/_index.yaml`)
- Regenerating a meta document from scratch
- Checking the consistency of the tracking files vs the actual tool state (Tiime, Revolut)
- Adding / removing a meta document (to reflect in this index)

This file is the machine-readable index of all the tracking/reference files of the workspace, with their owner_skill, structure, and regeneration procedure.

### Step 3 — Scan the workspace structure
Run:
```bash
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/juridique/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/contrat/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/factures/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/relevés/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/fiscal/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/expense/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/frais-locaux/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/receipts/ 2>/dev/null | wc -l
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/accountant/ 2>/dev/null
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/income-tax/ 2>/dev/null
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/income-tax/*.pdf 2>/dev/null | wc -l  # tax-documents inbox
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/income-tax/payslips/*.pdf 2>/dev/null | wc -l  # payslips inbox
ls /Users/gpaligot/Documents/ai-agents/expert-accountant/inbox/ 2>/dev/null  # unified inbox (dispatch-inbox)
```

Compare the file count per folder with what was expected per PROJET.md / memory:
- `juridique/`: ~15 PDFs expected
- `contrat/`: 2 PDFs + `stocks/` folder
- `factures/`: 7 invoices + 1 credit note
- `relevés/`: 6 Revolut statements (Nov 2025 → April 2026), expect 1 new per month
- `fiscal/`: 6 monthly CA3, expect 1 new per month
- `expense/`: 4 mileage notes, expect 1 new per month
- `frais-locaux/`: household invoices for the 6.50 % share (EDF, water, Free, property tax, etc.) — expect new receipts through the year
- `receipts/`: ~60+ receipts + 1 Tiime monthly Excel export
- `accountant/`: 3 topic subfolders (`an-nourriture/`, `points-divers/`, `convention-locaux/`) + `SCHEMA.md` + `_index.yaml` + `README.md`. Any new subfolder = a new open accountant topic.
- `income-tax/`: tax household IR folder. `SCHEMA.md` + top-level `_index.yaml` + 5 subfolders: `tax-notices/`, `property-taxes/`, `pre-filled-returns/`, `credit-advances/` (1 piece/year each, handled by `fiches-fiscales-describe`) and `payslips/` (23 payslips, handled by `bulletin-salaire-describe`). **Any PDF at the root of `income-tax/` = inbox of the `fiches-fiscales-describe` skill** (which detects the type and files it). Any PDF at the root of `payslips/` = inbox of `bulletin-salaire-describe`.
- `.script/`: YAML validation runner (`verify.py`) + `checks/` module + `requirements.txt`. Run at the end of any processing that writes YAML.
- `.schemas/`: formal JSON Schema (in YAML) applied by `.script/verify.py`. One file per family (`receipt`, `accountant-topic`, `payslip`, `tax-document`) + their respective index. For details, see `.script/README.md`.
- `inbox/`: unified inbox for any not-yet-sorted document. If it contains files at the root (other than `_README.md` and `_unknown/`), suggest the `dispatch-inbox` skill which detects the type and routes to the right sub-skill.

Any significant gap = a new document to analyze.

### Step 4 — Announce the state to the user
Produce a short, structured message at the end of the bootstrap:

```
J'ai bootstrappé le contexte du projet. Voici l'état :

📋 Profil : Gérard Paligot EURL (SIREN 992 805 804), EURL IS réel simplifié,
    activité conseil IT pour DuckDuckGo USA, exercice en cours du 01/11/2025
    au 31/12/2026.

🗂️ Workspace : <X> documents dans <Y> dossiers — <Z nouveaux par rapport au dernier état connu>.

⏳ Actions ouvertes en priorité :
    1. <reprendre depuis la section « Questions ouvertes » du PROJET.md>
    2. ...

❓ Voulez-vous : (a) traiter une action ouverte spécifique, (b) auditer un
    nouveau document, (c) autre sujet ?
```

### Step 5 — Do not duplicate work
Before proposing an analysis:
- Check in `audit_decisions_2026-05.md` whether a decision was already made on the topic
- Check in `remuneration_strategy.md` whether the strategy is already settled
- If so: **recall the decision already made** rather than replaying it

## Quick reference — Where to find what

| User question | Document to consult first |
|---|---|
| "Quels sont mes frais déductibles ?" | `guide-frais-deductibles-EURL-domicile.md` |
| "Combien dois-je me payer ?" | `strategie-remuneration-dirigeant.md` |
| "Audit de mes dépenses" | Excel `receipts/export-documents-*.xlsx` + `audit_decisions_2026-05.md` |
| "État de mes stock options DDG" | `guide-stock-options-DuckDuckGo.md` |
| "Convention bureau à domicile" | `convention-mise-a-disposition-locaux.md` |
| "Que dois-je envoyer au cabinet ?" | `accountant/_index.yaml` + `accountant/<topic>/_sujet.yaml` |
| "Où en est-on avec le cabinet ?" | `accountant/_index.yaml` (aggregated view, status + deadlines) |
| "Stratégie globale du dossier" | `PROJET.md` (sections 5 and 6) |
| "Une décision a-t-elle déjà été prise ?" | Memory in `~/.claude/projects/.../memory/` |
| "Quel net imposable du foyer pour l'IR ?" | `income-tax/payslips/_index.yaml` → `household_totals.<YYYY>` |
| "Bulletins de paie manquants ?" | `income-tax/payslips/_index.yaml` → `years.<YYYY>.<person>.missing_payslips` |
| "État des pièces fiscales du foyer ?" | `income-tax/_index.yaml` (covering income-tax-notice, property-tax, pre-filled-return, credit-advance + payslips ref) |
| "Combien à payer cette année / RFR / taux marginal ?" | `income-tax/_index.yaml` → `years.<YYYY>` |
| "Déclaration auto validée ou à modifier ?" | `income-tax/pre-filled-returns/<YYYY>_declaration-auto.yaml` → `alerts` + `to_complete` |
| "Je viens de déposer plein de PDF, range-les" | `dispatch-inbox` skill — detects the type and invokes the right sub-skill |

## Fiscal alert patterns to know (quick reference)

These patterns are already identified and their positions settled (see `audit_decisions_2026-05.md`):

| Pattern | Current decision |
|---|---|
| Picard/Otera groceries classified "RESTAURANT" | Maintained by Gérard on the accountant position; dropping the explicit batch-cooking lines recommended |
| Iceland trip April 2026 | Deductible (DDG business travel, no double mileage reimbursement) |
| Odyssée works 729 € (office painting) | Deductible subject to a signed convention |
| DDG invoice with 20 % VAT | To regularize (non-EU customer, art. 259-1 CGI) |
| TNS contributions, start-of-activity flat rate 148 €/month | Provision of 2 000 €/month to set aside |
| Capital 500 € + dividends | Strategy: 0 dividend, everything as remuneration |

**Do not re-flag these points unless a new supporting document contradicts the decision.**

## Skill maintenance

This skill evolves with the project. Update it when:
- A new document category appears in the workspace
- A strategic decision changes
- The folder structure changes

To modify, edit this file directly. For structural changes, also update `PROJET.md` at the workspace root.

## See also

- Global skill: `audit-accountant-paligot` in `~/.claude/skills/` — for detailed accounting audits
- Meta document: `PROJET.md` at the workspace root — project source of truth
- Memory: `~/.claude/projects/-Users-gpaligot-Documents-ai-agents-expert-accountant/memory/`
- YAML validation: `.script/README.md` — how to run `verify.py` and add a new schema type. Every skill that writes YAML must run the command at the end of processing (see their respective SKILL.md).
