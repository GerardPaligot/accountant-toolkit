---
name: projet-maintenir
description: Use this skill to create or update `PROJET.md` in your workspace. Guides the user through an interactive Q&A to document the company profile, household composition, person→key mappings, known employers, commercial activity, and open questions. Trigger when the user says « crée le PROJET.md », « mets à jour le PROJET.md », « configure le workspace », « initialise le projet », or when bootstrap reports that PROJET.md is missing.
---

# Skill — Create or update PROJET.md

## Overview

`PROJET.md` is the **source of truth** for all workspace-specific configuration. It is loaded at every session start by `bootstrap-projet` and consumed by all other skills. This skill guides the user interactively to produce or update it.

**Two modes**:
- **Initial setup** — `PROJET.md` does not yet exist; guide the user through all sections from scratch.
- **Update** — `PROJET.md` exists; read it first, then ask only what changed or is missing.

## When to use

- The workspace is new and has no `PROJET.md`
- Bootstrap reports that required fields are missing (person→key mapping, known employers, VAT number, etc.)
- The household composition changes (new employer, new child, member leaves, etc.)
- The EURL situation changes (new client, VAT regime change, manager status change)
- The user explicitly asks to refresh or correct PROJET.md

**Do not use for**: one-off accounting tasks. This skill only writes `PROJET.md`.

## Procedure

### Step 1 — Check for an existing PROJET.md

```bash
ls $WORKSPACE/PROJET.md 2>/dev/null && echo EXISTS || echo MISSING
```

- **EXISTS** → read the full file. Identify missing or outdated sections, and ask only targeted update questions. Skip sections that are already correct.
- **MISSING** → run the full interactive setup below.

### Step 2 — Interactive collection (section by section)

Use `AskUserQuestion` for structured fields, free conversation for narrative sections. Always **confirm each section** before moving to the next.

---

#### Section A — Company profile

Ask in one block via `AskUserQuestion` (or free conversation if the user prefers):

| Field | Question |
|---|---|
| Company name | Full legal name (e.g. "Dupont Conseil EURL") |
| SIREN | 9-digit SIREN number |
| SIRET | 14-digit SIRET (SIREN + establishment code) |
| Legal form | EURL / SASU / SARL / SAS / … |
| Share capital | Amount in euros |
| APE code | NAF/APE code and label |
| Activity start date | Date the activity started (ISO: YYYY-MM-DD) |
| RNE registration date | Date registered in RNE/INPI |
| First fiscal year | Start → end dates |
| Annual closing | Day/month (usually 31/12) |
| Registered office address | Full address |
| Tax regime | IS réel simplifié / IS réel normal / IR régime réel / micro |
| VAT regime | Mini-réel CA3 mensuelle / régime réel CA3 trimestrielle / franchise en base |
| Intra-Community VAT number | FR…… |
| Employees | Yes / No (if yes, how many) |

---

#### Section B — Manager profile

| Field | Question |
|---|---|
| Full name | First name + last name |
| Date of birth | ISO date (used for tax consistency checks) |
| Place of birth | City (country if abroad) |
| Nationality | Useful if non-French |
| Manager status | TNS majority manager (gérant majoritaire) / minority / salaried |
| If TNS: transition date | Date they became TNS (if mid-year) |
| If TNS: monthly net remuneration | Current monthly net (used for payslip-skip guard) |
| Marital situation | Married / PACS / single |
| Spouse / partner name | If applicable |
| Dependent children | Count + birth years |

---

#### Section C — Commercial activity

| Field | Question |
|---|---|
| Main client(s) | Name, country, payment entity |
| Invoicing frequency | Monthly / project-based |
| Invoicing label | Typical line item label on invoices |
| VAT treatment | e.g. B2B outside EU → non-taxable (art. 259-1 CGI), line E2 CA3 |
| Annual revenue estimate | HT, 12-month rolling |
| Bank | Name, IBAN |
| Accounting software | Name (e.g. Tiime) |
| Accounting firm | Name, monthly fee |
| Health insurance | Name, Madelin TNS eligible? |

---

#### Section D — Household composition (used by payslip and tax skills)

This section is **critical** — all payslip and tax skills derive folder paths and YAML keys from it.

For each household member who has payslips in the workspace:

| Field | Question |
|---|---|
| Full name (as on payslip) | All variants (e.g. "DUPONT JEAN" / "Jean Dupont") |
| Canonical person_key | Short lowercase slug used for folder names (e.g. `jean`, `marie`) |
| Role | EURL manager / employee / other |
| Active? | Still receiving payslips in the current workspace? |
| If employee: current employer | Employer name + kebab-case slug |
| If employee: departure date | If they left, the date |

Repeat for each member. When done, produce the complete mapping table.

---

#### Section E — Known employers

Derive from section D answers plus any additional employers mentioned.

| Company name (as on payslip) | Slug (kebab-case) | Person |
|---|---|---|
| … | … | … |

Ask: "Are there any other employers that appear in payslip file names or headers that I should recognise?"

---

#### Section F — EURL registered office (if applicable)

| Field | Question |
|---|---|
| Home-office convention | Yes / No |
| If yes: professional surface ratio | Percentage used for rebilling |
| Convention regime | A (free / gratuit) / B (loyer) |
| Convention signature date | ISO date |
| Internet/mobile rebilling | Percentage |
| Validated by accountant? | Yes / No / Pending |

---

#### Section G — Open questions and settled decisions

Ask: "Are there any settled accounting or tax positions you want to record? (e.g. meal-allowance scheme, specific deductibility decisions, client reimbursement policy)"

Record each as a one-line bullet under a "Décisions arrêtées" section. These prevent re-questioning on every session.

Ask: "Any open questions pending the accountant's reply?"

---

### Step 3 — Draft the PROJET.md

Produce a structured Markdown document in French, following this outline:

```
# PROJET — <company name>

> Document méta du workspace. Lu en premier par toute nouvelle conversation Claude.

**Dernière mise à jour** : <today ISO date>

---

## 1. Vue d'ensemble
<one-paragraph summary of the EURL purpose, fiscal year, first closing>

## 2. Profil société (constants)
<table with all company fields from Section A>

### Gérant et associé unique
<bullet list from Section B>

### Activité commerciale
<bullet list from Section C>

## 3. Foyer fiscal — membres et employeurs

### Clés canoniques des membres du foyer
<person→key mapping table from Section D — consumed by bulletin-salaire-describe and fiches-fiscales-describe>

### Employeurs connus
<slug table from Section E — consumed by bulletin-salaire-describe>

## 4. Structure du workspace
<folder tree — adapt from the plugin default or ask the user>

## 5. Convention de mise à disposition du local
<Section F content — only if applicable>

## 6. Décisions arrêtées
<settled decisions from Section G>

## 7. Questions ouvertes
<open questions from Section G>
```

### Step 4 — Review with the user

Present the draft and ask:

> "Voici le PROJET.md que j'ai produit. Veux-tu corriger ou compléter quelque chose avant que je l'écrive ?"

Apply any corrections, then write the file with the `Write` tool.

### Step 5 — Write the file

```bash
# Check PROJET.md doesn't already have a conflicting version
ls $WORKSPACE/PROJET.md 2>/dev/null
```

If the file exists: present a diff summary of what changes before overwriting.

Write: `$WORKSPACE/PROJET.md`

Confirm to the user: "PROJET.md mis à jour. Le bootstrap utilisera automatiquement la nouvelle configuration au prochain démarrage."

## Guardrails

- **Never invent values** — if the user doesn't know a field, write `# TODO: <field>` as a placeholder.
- **Preserve existing content** in update mode — only change the sections the user explicitly reviewed.
- **Do not write personal data** (tax numbers, birthdates, addresses) that the user hasn't provided.
- **person_key must be unique** per household member and stable over time — warn if the user proposes changing one (would break existing YAML file paths).
- **Slug must be kebab-case** — validate and auto-correct (lowercase, spaces → hyphens, no accents).

## See also

- Skill `bootstrap-projet` — reads PROJET.md at every session start
- Skill `bulletin-salaire-describe` — reads `person_key` and employer slug from PROJET.md
- Skill `fiches-fiscales-describe` — reads household composition from PROJET.md
- Skill `dispatch-inbox` — reads known employer keywords from PROJET.md
- `workspace.properties` — separate file for the workspace path (not in PROJET.md)

## Skill maintenance

Update this skill when:
- A new section is added to PROJET.md (e.g. new asset type, new sub-skill adds a dependency)
- A new skill consumes a field from PROJET.md (add it to the "See also" list)
