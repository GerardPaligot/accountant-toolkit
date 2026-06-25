---
name: bootstrap-projet
description: Use when starting a new conversation in the workspace or whenever Claude needs to refresh its context about the project's accounting/fiscal situation. Reads PROJET.md, check git staging files to detect new files, loads memory directory, and produces a state summary before any other action.
---

# Project bootstrap

## Overview

Skill to bootstrap a conversation in the workspace. It loads the full project state (company profile, settled decisions, open questions, document inventory) in a minimal number of steps, and tells the user what has changed since the last session.

## When to use

- **Always** at the start of a new Claude conversation where this skills is installed, or when the user asks to "refresh the context" of the project.
- Before any audit, fiscal analysis, or drafting of a note for the accountant
- When Claude's memory is suspected to be stale (e.g. after a long interruption)

**Do not use for**: one-off technical tasks in other workspaces, general French-tax questions unrelated to this EURL.

## Bootstrap procedure (run in order)

### Configuration

**Step 0 — resolve workspace path and export it.**

Read `workspace.properties` at the root of the accountant plugin (same directory as `README.md`). The file has one key:

```properties
ACCOUNTANT_WORKSPACE=/path/to/your/expert-accountant/workspace
```

If the file is missing, tell the user to copy `workspace.properties.example` and set the path.

Once resolved, immediately export the variable so all Python scripts inherit it without needing their own config lookup:

```bash
export ACCOUNTANT_WORKSPACE="/path/to/workspace"
```

Then derive the two path variables used throughout this skill:

```
WORKSPACE  = value of ACCOUNTANT_WORKSPACE
MEMORY_DIR = ~/.claude/projects/<WORKSPACE with every "/" replaced by "-">/memory
```

**Derivation rule for `MEMORY_DIR`:** take `WORKSPACE`, replace every `/` with `-` (the leading `/` becomes the leading `-`), prefix with `~/.claude/projects/`, suffix with `/memory`.  
Example: `WORKSPACE=/home/alice/expert-accountant` → `MEMORY_DIR=~/.claude/projects/-home-alice-expert-accountant/memory`

All paths below use `$WORKSPACE`, `$MEMORY_DIR`, and `$SKILL_DIR`. Substitute the resolved values before reading or running any command.

- `$WORKSPACE` — value of `ACCOUNTANT_WORKSPACE`
- `$MEMORY_DIR` — derived as above
- `$SKILL_DIR` — absolute path to the directory containing the current skill's `SKILL.md` (Claude derives this from wherever it loaded the skill file; used to invoke co-located scripts without hardcoding a path)

### Step 1 — Load the memory index
Read `$MEMORY_DIR/MEMORY.md`, then the linked files in order:
1. `user_profile.md`
2. `project_workspace.md`
3. `remuneration_strategy.md`
4. `audit_decisions_2026-05.md`
5. `convention_locaux_decision.md`
6. Any other `*.md` file present

### Step 2 — Load the meta document
Read `$WORKSPACE/PROJET.md` which consolidates:
- Company profile (constants)
- Document inventory
- Settled decisions
- Open questions
- Glossary

This file is **the project source of truth**. If any info there contradicts the memory, PROJET.md wins (it is updated manually by the user).

### Step 2b — Load the accountant index
Read `$WORKSPACE/accountant/_index.yaml` to immediately get the list of open accountant topics, their status (draft, sent, reply-received, resolved) and the upcoming deadlines.

When the user asks « où en est-on avec le cabinet ? », « quelle réponse attend-on ? », « quoi à confirmer ? », this is the first source to consult before PROJET.md.

If the session involves creating or updating an accountant topic (drafting a note, sending an email, recording a reply), read `$SKILL_DIR/SCHEMA-accountant-topic.md` — the normative `_sujet.yaml` schema, bundled with this skill — to stay conformant.

### Step 2c — (optional) Load the meta-docs index
Read `$WORKSPACE/_meta_docs.yaml` if the session involves:
- Modifying the structure of a meta document (`_tiime_*`, `_revolut_*`, `_index.yaml`, `SCHEMA.md`, `accountant/_index.yaml`)
- Regenerating a meta document from scratch
- Checking the consistency of the tracking files vs the actual tool state (Tiime, Revolut)
- Adding / removing a meta document (to reflect in this index)

This file is the machine-readable index of all the tracking/reference files of the workspace, with their owner_skill, structure, and regeneration procedure.

### Step 3 — Scan the workspace structure
Run the commands below, substituting `$WORKSPACE` with the resolved absolute path:
```bash
ls $WORKSPACE/
ls $WORKSPACE/juridique/ 2>/dev/null | wc -l
ls $WORKSPACE/contrat/ 2>/dev/null | wc -l
ls $WORKSPACE/factures/ 2>/dev/null | wc -l
ls $WORKSPACE/relevés/ 2>/dev/null | wc -l
ls $WORKSPACE/fiscal/ 2>/dev/null | wc -l
ls $WORKSPACE/expense/ 2>/dev/null | wc -l
ls $WORKSPACE/frais-locaux/ 2>/dev/null | wc -l
ls $WORKSPACE/receipts/ 2>/dev/null | wc -l
ls $WORKSPACE/accountant/ 2>/dev/null
ls $WORKSPACE/income-tax/ 2>/dev/null
ls $WORKSPACE/income-tax/*.pdf 2>/dev/null | wc -l  # tax-documents inbox
ls $WORKSPACE/income-tax/payslips/*.pdf 2>/dev/null | wc -l  # payslips inbox
ls $WORKSPACE/inbox/ 2>/dev/null  # unified inbox (dispatch-inbox)
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
- `accountant/`: 3 topic subfolders (`an-nourriture/`, `points-divers/`, `convention-locaux/`) + `_index.yaml` + `README.md`. Any new subfolder = a new open accountant topic. (The topic schema is bundled with this skill as `SCHEMA-accountant-topic.md`, not stored in the workspace.)
- `income-tax/`: tax household IR folder. Top-level `_index.yaml` + 5 subfolders: `tax-notices/`, `property-taxes/`, `pre-filled-returns/`, `credit-advances/` (1 piece/year each, handled by `fiches-fiscales-describe`) and `payslips/` (23 payslips, handled by `bulletin-salaire-describe`). (The schemas are bundled with those describe-skills, not stored in the workspace.) **Any PDF at the root of `income-tax/` = inbox of the `fiches-fiscales-describe` skill** (which detects the type and files it). Any PDF at the root of `payslips/` = inbox of `bulletin-salaire-describe`.
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
