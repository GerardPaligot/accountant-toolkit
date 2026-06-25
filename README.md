# accountant-toolkit

A reusable toolkit for managing a French **EURL accountant workspace** — a folder
of receipts, payslips, tax documents and correspondence described as validated
YAML fiches, then pushed to accounting tools.

It ships three things from one repo:

1. **A Claude Code plugin** (`plugins/accountant`) — skills
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

## Layout

```
.                                       # repo root IS the toolkit
├── .claude-plugin/marketplace.json     # makes this repo a Claude plugin marketplace
├── plugins/accountant/                 # the plugin — skills auto-discovered
│   ├── .claude-plugin/plugin.json
│   └── skills/<skills>/SKILL.md
├── packages/
│   ├── accountant-cli/                 # YAML validator (Node/TS) + bundled schemas + manifest
│   └── revolut-cli/                    # one CLI per bank (Revolut today; qonto-cli, … later)
├── docs/superpowers/                   # design specs & implementation plans
├── package.json                        # npm workspaces root (packages/*)
├── README.md                           # (this file)
├── ARCHITECTURE.md                     # architecture & decisions
└── CONTRIBUTING.md                     # how to contribute + proposed skills roadmap
```

## The skills

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
| `accountant-cli` | How to use the `accountant` CLI to validate workspace YAML. |
| `revolut-cli` | How to use the `revolut` CLI to read Revolut Business data. |

## Quickstart

### Install the skills (plugin)

```
/plugin marketplace add GerardPaligot/<repo-hosting-this-marketplace>
/plugin install accountant@accountant-toolkit
```

Skills are auto-discovered from `skills/<name>/SKILL.md` — nothing else to declare.

### Install the CLIs (local, no registry)

This is a single-user toolkit, so the CLIs are **installed locally from this
checkout** — not published to a package registry. Build once, then `npm link`
each package to put its command on your `$PATH`:

```bash
npm install                              # npm workspaces: deps for both CLIs
npm run build                            # builds every package → dist/
npm test                                 # runs every package's tests

# expose the bins globally (symlinks into this checkout)
( cd packages/accountant-cli && npm link )   # → `accountant`
( cd packages/revolut-cli   && npm link )    # → `revolut`
```

Because `npm link` symlinks the global command at `dist/index.js`, a later
`npm run build` is picked up automatically — no reinstall. (To remove a bin:
`npm rm -g @gpaligot/accountant-cli` / `npm rm -g revolut-business-cli`.) If you
prefer not to link, run a CLI directly:
`node packages/accountant-cli/dist/index.js verify …`.

### Validate an accountant workspace

```bash
# from inside the accountant folder, or pass --workspace
accountant verify --workspace /path/to/accountant-folder
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
