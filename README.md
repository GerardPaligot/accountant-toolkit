# accountant-toolkit

A reusable toolkit for managing a French **EURL accountant workspace** — a folder
of receipts, payslips, tax documents and correspondence described as validated
YAML fiches, then pushed to accounting tools.

It ships three things from one repo:

1. **A Claude Code plugin** (`plugins/accountant`) — 10 skills
   that turn source documents into YAML fiches and push their metadata to Tiime
   and Revolut Business.
2. **`accountant` CLI** (`packages/accountant-cli`) — validates
   the YAML the skills produce against bundled JSON Schemas, plus inter-file
   consistency checks. Deterministic, no LLM, fast, low token cost.
3. **`revolut` CLI** (`packages/revolut-cli`) — a read-only
   client of the official Revolut Business API, used by the
   `revolut-attach-justificatifs-cli` skill to inventory expenses without
   driving a browser.

**The idea:** any accountant folder holds *only data*. The schemas, validation
logic and skills live here, in the toolkit, and are installed — not copied — into
each project. That is what makes it reusable.

> **Repo history note.** This repository began as a mirror of the official
> Revolut OpenAPI specifications. It has been repurposed as the home of
> `accountant-toolkit`; the raw `json/` and `yaml/` spec folders were removed when
> the git history was reset. See [ARCHITECTURE.md](./ARCHITECTURE.md) for the
> consequences (notably: the `revolut` CLI's client is committed and runs, but
> its `gen` step needs the spec re-vendored — tracked in
> [CONTRIBUTING.md](./CONTRIBUTING.md)).

## Layout

```
.                                       # repo root IS the toolkit
├── .claude-plugin/marketplace.json     # makes this repo a Claude plugin marketplace
├── plugins/accountant/                 # the plugin — skills auto-discovered
│   ├── .claude-plugin/plugin.json
│   └── skills/<10 skills>/SKILL.md
├── packages/
│   ├── accountant-cli/                 # YAML validator (Node/TS) + bundled schemas + manifest
│   └── revolut-cli/                    # one CLI per bank (Revolut today; qonto-cli, … later)
├── docs/superpowers/                   # design specs & implementation plans
├── package.json                        # npm workspaces root (packages/*)
├── README.md                           # (this file)
├── ARCHITECTURE.md                     # architecture & decisions
└── CONTRIBUTING.md                     # how to contribute + proposed skills roadmap
```

## The 10 skills

| Skill | Role |
|---|---|
| `bootstrap-projet` | Load project context at session start (memory, indexes). |
| `justificatif-describe` | Analyze receipts → one YAML fiche per receipt. |
| `bulletin-salaire-describe` | Analyze payslips → one YAML fiche per payslip/person. |
| `fiches-fiscales-describe` | Analyze personal tax documents (notice, property tax, pre-filled return, credit advance). |
| `enrich-justificatifs` | Enrich existing receipt fiches with complementary info. |
| `dispatch-inbox` | Detect the type of each file dropped in `inbox/` and route it to the right sub-skill. |
| `impots-fr` | French income-tax guidance / workflow. |
| `tiime-upload-justificatifs` | Push YAML metadata to Tiime (Playwright MCP). |
| `revolut-attach-justificatifs` | Attach receipts to Revolut Business transactions (Playwright MCP). |
| `revolut-attach-justificatifs-cli` | Same, but uses the `revolut` CLI for the fast read/inventory phase. |

## Quickstart

### Install the skills (plugin)

```
/plugin marketplace add GerardPaligot/<repo-hosting-this-marketplace>
/plugin install accountant@accountant-toolkit
```

Skills are auto-discovered from `skills/<name>/SKILL.md` — nothing else to declare.

### Build & test the CLIs

```bash
npm install        # npm workspaces: installs both CLIs
npm run build      # builds every package
npm test           # runs every package's tests
```

### Validate an accountant workspace

```bash
# from inside the accountant folder, or pass --workspace
node packages/accountant-cli/dist/index.js verify \
  --workspace /path/to/accountant-folder
```

`accountant verify` reads the workspace's `_meta_docs.yaml` (or the bundled
default), validates each declared family of YAML against its schema, then runs
the consistency checks. Exit code is non-zero on any error.

### Use the Revolut CLI

```bash
revolut auth setup                                   # one-time OAuth consent
revolut expenses list --state missing_info --from 2026-01-01 --to 2026-02-01
```

See `packages/revolut-cli/README.md` for the full command set.

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — design, the data/doctrine split, the Python→Node port, decisions, known issues.
- [CONTRIBUTING.md](./CONTRIBUTING.md) — dev setup, how to add a schema / check / skill / bank CLI, and the **proposed-skills roadmap**.
- `docs/superpowers/` — the original design specs and implementation plans.
