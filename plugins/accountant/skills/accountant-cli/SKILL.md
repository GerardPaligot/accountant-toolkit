---
name: accountant-cli
description: How to use the `accountant` CLI — a deterministic validator for an accountant workspace's YAML fiches. It checks every fiche against its JSON Schema and runs inter-file consistency checks, fast and with zero tokens. Trigger after producing or editing YAML fiches (receipts, payslips, tax documents, indexes), when the user asks to "verify the workspace", "validate the YAML", "check the fiches", "run accountant verify", or before handing data to the accountant.
---

# Skill — Using the `accountant` CLI

## What it is

`accountant` validates the YAML files of an accountant workspace. It reads the
workspace manifest (`_meta_docs.yaml`), and for each declared family of files it:

1. resolves the files (by exact `path`, or by `path_pattern` regex),
2. validates each against its JSON Schema (Draft 2020-12),
3. runs the declared **consistency checks** (e.g. an index must reference exactly
   its source documents — no missing, no orphan).

It is pure computation — instant, reproducible, no LLM, no tokens. **Run it after
any skill produces or edits fiches** (`justificatif-describe`,
`bulletin-salaire-describe`, `fiches-fiscales-describe`, `enrich-justificatifs`,
`dispatch-inbox`) and before handing data to the accountant. The describe-skills
produce; this CLI is the hard gate that verifies.

## Prerequisites

`accountant` on the PATH. Check `accountant --help`. If the command is not found, stop
your workflow and ask to the user to install the `accountant` CLI.

## Command reference

```bash
accountant verify [--workspace <dir>] [--manifest <path>] [--type <id>] [--strict]
```

| Flag | Meaning |
|---|---|
| `--workspace <dir>` | Workspace root to validate. Default: current directory. |
| `--manifest <path>` | Manifest to use. Default: `<workspace>/_meta_docs.yaml`; if absent, the **bundled** default manifest. |
| `--type <id>` | Validate only one manifest entry by `id` (e.g. `receipt`, `payslip`). Consistency checks still scan all entries. |
| `--strict` | Treat warnings as errors. |

### Schema resolution

For each entry's `schema:` path, the CLI prefers the **workspace copy** (e.g.
`<workspace>/.schemas/receipt.schema.yaml`) and falls back to the **bundled**
schema shipped with the CLI. So a bare data folder with no local `.schemas/` or
`_meta_docs.yaml` still validates against the bundled doctrine — zero local config.

## Output & exit code

Per entry: `[OK]` (schema OK / check passed), `[FAIL]` (with the offending file
and the JSON-Schema error path), `[WARN]` (no file matched a pattern), `[..]`
(no schema declared). Final summary line gives the file/error counts.

**Exit code 0 = clean; non-zero = errors** (the count, capped at 255). Use it as
a gate in scripts. `NO_COLOR=1` disables ANSI colors for clean logs.

## Examples

```bash
# Validate the whole workspace (run from inside it)
accountant verify

# Validate a workspace elsewhere
accountant verify --workspace /Users/me/accounting-folder

# Only the receipt fiches
accountant verify --workspace /Users/me/accounting-folder --type receipt

# Clean output for logs / CI
NO_COLOR=1 accountant verify --workspace /Users/me/accounting-folder
```

Example of a clean run:

```
[OK]   receipt                      → 96 file(s), schema OK
[OK]   payslip                      → 23 file(s), schema OK
[OK]   index_aggregates_documents (payslips_index)
[OK]   Summary: 131 file(s) validated, 0 error.
```

## Reading and fixing failures

A failure looks like:

```
[FAIL] receipt                      → 96 file(s), 1 in error
       receipts/2026-01/foo.yaml /merchant/name: must be string
```

- The path after the filename (`/merchant/name`) is the **location inside the
  YAML**; the message is the JSON-Schema violation. Open that file, fix that key.
- `schema missing: …` → the `schema:` path in the manifest is wrong, or the
  schema isn't bundled/in-workspace.
- A consistency `[FAIL]` like `document not referenced in the index` /
  `index reference without a source document` means an `_index.yaml` drifted from
  its source fiches — rebuild the index (the owning describe-skill regenerates it).

Fix the fiche (or index), then re-run `accountant verify` until it exits 0.

## When to run it

- After `dispatch-inbox` routes and describes new files.
- After any `*-describe` skill writes fiches, or `enrich-justificatifs` edits them.
- Before pushing data to Tiime/Revolut or handing it to the accountant.
- As a year-end / pre-commit gate over the whole workspace.

## Extending it

New file families and new cross-checks are added in `packages/accountant-cli`
(schema + `meta-docs.yaml` entry, or a new check in `src/checks/consistency.ts`).
See `CONTRIBUTING.md` and the proposed `add-yaml-resource` /
`add-consistency-check` skills.
