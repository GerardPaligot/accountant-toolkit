# Contributing to accountant-toolkit

This repo bundles a Claude Code plugin (skills), two Node CLIs, and the schemas
they enforce. Read [ARCHITECTURE.md](./ARCHITECTURE.md) first for the big
picture. This file covers dev setup, the common "how do I add X" recipes, and a
**roadmap of skills worth writing**.

## Dev setup

```bash
npm install        # npm workspaces — installs accountant-cli and revolut-cli
npm test           # all packages
npm run build      # all packages
npm run typecheck  # all packages
```

Per-package work:

```bash
npm test      -w @gpaligot/accountant-cli
npm run build -w @gpaligot/accountant-cli
```

Conventions: TypeScript (ESM, `moduleResolution: bundler`), `tsup` for the bin,
`vitest` for tests with tmp-dir fixtures (no committed fixture trees). Match the
existing module layout — one responsibility per file.

## How to add a new validated YAML family

1. Write `packages/accountant-cli/schemas/<thing>.schema.yaml`
   (JSON Schema 2020-12).
2. Add an entry to `packages/accountant-cli/meta-docs.yaml`:
   `id`, `type: document|index`, `path_pattern` (anchored regex) or `path`,
   `schema: .schemas/<thing>.schema.yaml`, and optional `consistency_checks`.
3. Add a `verify.test.ts`-style case proving a good file passes and a bad one
   fails.
4. Run `accountant verify --workspace <a real folder>` to confirm.

(See the proposed `add-yaml-resource` skill below — it automates exactly this.)

## How to add a consistency check

1. Implement the check in `packages/accountant-cli/src/checks/consistency.ts`
   with signature `(workspace, entry, args, filesById) => CheckError[]`.
2. Register it in the `CONSISTENCY_CHECKS` map.
3. Reference it from a manifest entry's `consistency_checks`.
4. Add a unit test in `test/checks.test.ts`.

## How to add a skill

Skills are **auto-discovered** — just create the folder:

```
plugins/accountant/skills/<skill-name>/SKILL.md
```

`SKILL.md` needs YAML frontmatter (`name`, `description` with clear triggers).
No registration anywhere — the plugin picks it up. Keep any helper scripts in the
skill folder, but prefer adding a `accountant` subcommand over shipping Python
(see the toolchain cleanup below).

## How to add a CLI for a new bank

Each bank integration is its own workspace package, named `<bank>-cli`, living
next to `revolut-cli`. `revolut-cli` is the reference implementation.

1. Create `packages/<bank>-cli/` with a `package.json` whose
   `name` is `@gpaligot/<bank>-cli` and whose `bin` exposes a single command
   (e.g. `qonto`). It is picked up automatically by the root `workspaces:
   ["packages/*"]` — no extra registration.
2. Keep it read-only and deterministic where the bank's API allows; document any
   capability the API lacks (e.g. Revolut has no receipt-upload, so a Playwright
   skill still does the write). Mirror `revolut-cli`'s structure: generated
   client (committed) + thin command layer + tests.
3. The skill that drives that bank depends on this CLI for its fast read/inventory
   phase, exactly as `revolut-attach-justificatifs-cli` uses `revolut`.
4. `npm install && npm test` from the repo root covers the new package.

---

## Proposed skills roadmap

Grounded in the real accountant workspace this toolkit was extracted from. The
current 10 skills cover the **expense** side (receipts, payslips, personal tax
docs) and two push targets (Tiime, Revolut). The gaps below are the obvious next
contributions, prioritized.

### Tier 1 — meta-skills that make the toolkit self-extending

| Skill | What it does | Why it matters |
|---|---|---|
| `add-yaml-resource` | Walks a contributor through adding a new YAML family end-to-end: schema + `meta-docs.yaml` entry + consistency check + test, then runs `accountant verify`. | This existed in the original workspace but was **not** carried over. It is the keystone that lets the framework grow without tribal knowledge. Write it first. |
| `verify-workspace` | Runs `accountant verify`, reads the failures, explains each in plain language and proposes a concrete fix to the offending fiche. | The missing bridge between the deterministic CLI and the LLM. Turns a raw `[FAIL] /merchant: must be string` into an actionable edit. |
| `add-consistency-check` | Scaffolds a new cross-file check (function + registration + manifest wiring + test). | Consistency rules are where most real accounting bugs hide (an index that drifts from its sources). Lowering the cost to add one pays off. |

### Tier 2 — domain coverage gaps (revenue & reconciliation)

| Skill | What it does | Why it matters |
|---|---|---|
| `facture-emise-describe` | Describe **issued/outgoing** invoices (revenue) into YAML fiches, mirroring `justificatif-describe` on the income side. | The toolkit currently only sees expenses. Revenue is the other half of the books; without it no turnover/VAT-collected view exists. Highest-value domain gap. |
| `releve-bancaire-describe` | Parse bank statements (`relevés/`) into YAML and reconcile each line against existing receipt/expense fiches, flagging unmatched movements. | Reconciliation is the audit backbone — it catches missing receipts and phantom entries. Pairs naturally with a new `statement_reconciles_documents` consistency check. |
| `tva-declaration` | Aggregate recoverable VAT (from `receipts_index`) and collected VAT (from issued invoices) into a periodic VAT-return worksheet. | Recurring obligation; the data already exists in the indexes, only the aggregation/report is missing. |

### Tier 3 — remaining document families & year-end

| Skill | What it does | Why it matters |
|---|---|---|
| `assurance-contrat-describe` | Describe insurance/contract/legal documents (`assurance/`, `contrat/`, `juridique/`) into YAML with renewal dates and deadline tracking. | These folders exist but are unstructured. Renewal/deadline tracking is a concrete, recurring pain. |
| `frais-locaux-describe` | Structure home-office cost allocation (`frais-locaux/`) — the EURL-at-domicile deduction — into a defensible YAML fiche. | A guide already exists in prose; turning it into validated fiches makes the deduction audit-ready. |
| `cloture-exercice` | Year-end closing orchestrator: rebuild every index, run `accountant verify`, and produce a single hand-off summary for the accountant. | One ritual that ties all the indexes together; reduces a stressful manual checklist to one skill. |

---

## Toolchain cleanup tasks (good first contributions)

These are tracked in [ARCHITECTURE.md](./ARCHITECTURE.md) → *Known issues*:

1. **Port the Python helpers to Node.** Five skills still shell out to
   `build_index.py` (×3), `scan_gaps.py`, `apply_update.py`. Port them into
   `accountant` subcommands (`build-index`, `scan-gaps`, `apply-update`), update
   the skills' `SKILL.md`, and the toolkit becomes Node-only (no Python runtime).
2. **Re-vendor the Revolut spec.** The `revolut-cli` `gen` script points at the
   deleted `../json/business.json`. Vendor the spec into
   `packages/revolut-cli/spec/business.json` and repoint `gen`, so the client can
   be regenerated after a Revolut API change.

## Before opening a PR

- `npm test` and `npm run typecheck` pass at the repo root.
- New YAML families ship a schema **and** a test.
- New skills have clear `description` triggers and don't duplicate an existing
  skill's scope (link to the twin instead, as `revolut-attach-justificatifs-cli`
  does).
