# accountant — Claude Code plugin

Skills to manage a French EURL accountant workspace. Each skill turns a class of
source documents into validated YAML fiches, or pushes that data to an external
tool. They pair with the `accountant` CLI (`packages/accountant-cli`), which
validates the produced YAML against the bundled schemas.

## Skills

| Skill | Role |
|---|---|
| `bootstrap-projet` | Load project context at session start (memory, indexes). |
| `justificatif-describe` | Analyze receipts → one YAML fiche per receipt. |
| `bulletin-salaire-describe` | Analyze payslips → one YAML fiche per payslip/person. |
| `fiches-fiscales-describe` | Analyze personal tax documents (notice, property tax, pre-filled return, credit advance). |
| `enrich-justificatifs` | Enrich existing receipt fiches with complementary info. |
| `dispatch-inbox` | Detect the type of each file dropped in `inbox/` and route it to the right sub-skill. |
| `impots-fr` | French income-tax guidance/workflow. |
| `tiime-upload-justificatifs` | Push YAML metadata to Tiime (Playwright MCP). |
| `revolut-attach-justificatifs` | Attach receipts to Revolut Business transactions (Playwright MCP). |
| `revolut-attach-justificatifs-cli` | Same, but uses the `revolut` CLI for the fast read/inventory phase. |

## Install

```
/plugin marketplace add GerardPaligot/<repo-hosting-this-marketplace>
/plugin install accountant@accountant-toolkit
```

Skills are auto-discovered from `skills/<name>/SKILL.md` — no extra declaration.

## Companion CLIs

- `accountant` — validates the workspace YAML (`packages/accountant-cli`).
- `revolut` — read-only Revolut Business API client used by
  `revolut-attach-justificatifs-cli` (`packages/revolut-cli`).
