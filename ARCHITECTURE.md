# Architecture — accountant-toolkit (repo-wide)

> Date: 2026-06-25 · Status: post-reset consolidation.
>
> This repository **is** the toolkit: its contents live at the repo root so the
> `.claude-plugin/marketplace.json` is found by `/plugin marketplace add`. This
> document covers the whole repo — the map, the decisions, and the known issues.

## What this repo is

A single home for everything needed to run an **accountant workspace** without
re-implementing it per project:

- the **skills** (Claude Code plugin) that do the human-judgement work —
  reading a receipt, classifying a tax document, deciding what a transaction is;
- the **`accountant` CLI** that does the deterministic work — validating that the
  YAML the skills produced is well-formed and internally consistent;
- the **`revolut` CLI** that does the read-only API work — inventorying Revolut
  expenses so a skill doesn't have to scrape a browser;
- the **schemas + manifest** that encode the doctrine (what a valid fiche is).

## The core split: data vs doctrine

The design principle behind the whole toolkit:

```
ACCOUNTANT WORKSPACE (per project)        TOOLKIT (this repo, shared)
─────────────────────────────────        ───────────────────────────
receipts/2026-01/*.yaml      (data)       schemas/*.schema.yaml   (doctrine)
income-tax/payslips/*.yaml   (data)       meta-docs.yaml          (registry)
accountant/<topic>/_sujet.yaml (data)     skills/                 (procedures)
_meta_docs.yaml  (optional override)      accountant verify        (enforcement)
```

A workspace contains only the fiches (data). The rules that say what a fiche
must look like, and the procedures that produce them, live in the toolkit and
are *installed*. A workspace may override the bundled schemas/manifest by
shipping its own `.schemas/` + `_meta_docs.yaml`; otherwise the bundled ones
apply. Schema resolution is **workspace-copy-first, bundled-fallback**, so a bare
data folder validates with zero local config.

## Components & responsibilities

### Plugin — `plugins/accountant`

`.claude-plugin/plugin.json` declares the plugin; the repo-root
`.claude-plugin/marketplace.json` lists it with a relative `source`. Skills are
**auto-discovered** from `skills/<name>/SKILL.md` — no manifest list.

Two skills (`tiime-upload-justificatifs`, `revolut-attach-justificatifs`) drive a
browser via Playwright MCP because the target tools have **no write API**.
`revolut-attach-justificatifs-cli` is the accelerated variant: it uses the
`revolut` CLI for the read/inventory phase (fast, cheap) and keeps Playwright
only for the upload.

### `accountant` CLI — `packages/accountant-cli`

A faithful Node/TypeScript port of the workspace's former Python validator. It
reads the manifest (`_meta_docs.yaml`), resolves each declared family of YAML by
`path` or `path_pattern`, validates against the JSON Schema (Draft 2020-12 via
Ajv), then runs the registered consistency checks. Per-module mapping:

| Python source | Node module | Responsibility |
|---|---|---|
| `yaml_loader.py` | `src/yaml.ts` | Parse YAML keeping ISO dates as strings (CORE_SCHEMA), stringify keys. |
| `verify.py` (file discovery) | `src/manifest.ts` | Load `_meta_docs.yaml`; resolve files by `path` or `path_pattern` regex. |
| `verify.py` (validation loop) | `src/verify.ts` | JSON Schema (2020-12, via Ajv) validation + consistency dispatch. |
| `checks/consistency.py` | `src/checks/consistency.ts` | `index_aggregates_documents` cross-check + registry. |
| ANSI logging | `src/output.ts` | `[OK]/[FAIL]/[WARN]/[..]` output. |
| `argparse` entry | `src/index.ts` | `accountant verify` (commander), `--workspace/--manifest/--type/--strict`. |

Faithfulness: Ajv runs with `validateFormats: false` to match Python's
`Draft202012Validator` *without* a format checker; `path_pattern` uses the
manifest's `^…$`-anchored regexes (Python `re.match` semantics); output and exit
code mirror the original (exit = `min(errors, 255)`). Build: **tsup** bundles
`src/index.ts` → `dist/index.js`; schemas + `meta-docs.yaml` ship via the package
`files` field and are read relative to the package root.

Why a separate deterministic CLI at all: the validation is pure computation. Done
by an LLM it would be slow, expensive in tokens, and non-reproducible. Done by a
CLI it is instant, free, and a hard gate. The skills produce; the CLI verifies.

### `revolut` CLI — `packages/revolut-cli`

A read-only client of the official Revolut Business API, generated from the
OpenAPI spec. The Revolut Business API has **no** receipt-upload or
expense-mutation endpoint, so this CLI cannot replace the Playwright upload — it
only replaces the slow, token-heavy *inventory* phase. Its generated client is
committed, so it builds and runs as-is.

## Decisions

1. **One monorepo.** Marketplace manifest, plugin and both CLIs share one tree,
   one test run. npm workspaces (`packages/*`) tie the CLIs together.
2. **Schemas bundled with the CLI**, with per-workspace override. This is the
   mechanism that turns a one-off workspace into a framework.
3. **npm distribution** for the CLIs (each has a `bin`). Native single-file
   binaries (Node SEA) can come later; npm suffices while Node is present.
4. **Two separate binaries, not one.** A network API client (`revolut`) and a
   local file validator (`accountant`) are different concerns; they cohabit the
   repo but ship separately.
5. **Skills were copied, not moved**, from the `expert-accountant` data workspace
   during extraction, so that workspace kept working during the transition.
6. **One CLI package per bank.** Each bank integration is its own
   `packages/<bank>-cli` workspace package (today:
   `revolut-cli`; future: `qonto-cli`, `bnp-cli`, …). They share the toolkit's
   single `npm install` / `build` / `test`, which is what "compatible with the
   toolkit" means. A skill that drives a given bank depends on that bank's CLI.

## Known issues / cleanup (tracked in CONTRIBUTING.md)

1. **`gen` step is broken.** Each bank CLI's `gen` script points at
   `../json/business.json`, which was deleted with the spec folders. The
   *generated client is committed*, so build/run/test are unaffected — but
   regenerating after a Revolut spec change requires re-vendoring the spec
   (e.g. into `packages/revolut-cli/spec/business.json`) and repointing `gen`.
2. **Five skills still shell out to Python.** `justificatif-describe`,
   `fiches-fiscales-describe`, `bulletin-salaire-describe` ship a
   `build_index.py`; `enrich-justificatifs` ships `scan_gaps.py` +
   `apply_update.py`. These should be ported into `accountant` subcommands so the
   toolkit is single-toolchain (Node only). Until then, those skills require
   Python 3 + PyYAML at runtime.

## Status

- ✅ Plugin + marketplace, 10 skills, `accountant verify` (full Python→Node port,
  validated against 131 real fiches), bundled schemas, tests, `revolut` CLI.
- ⏳ The two cleanup items above, plus the proposed-skills roadmap in
  CONTRIBUTING.md.
