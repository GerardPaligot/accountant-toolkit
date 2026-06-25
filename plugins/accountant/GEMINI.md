# accountant — plugin for Gemini CLI

French EURL accountant workspace toolkit. Skills turn source documents (receipts,
payslips, tax documents) into validated YAML fiches, then push their metadata to
accounting tools.

## Available skills

Load a skill with the `activate_skill` tool before following its procedure.

| Skill name | When to invoke |
|---|---|
| `bootstrap-projet` | **Always first** — loads project context (PROJET.md, memory, indexes) |
| `justificatif-describe` | New receipts/invoices dropped in `receipts/` |
| `bulletin-salaire-describe` | New payslips dropped in `income-tax/payslips/` |
| `fiches-fiscales-describe` | New DGFiP tax documents dropped in `income-tax/` |
| `enrich-justificatifs` | Fill open warnings / `info_to_complete` on existing receipt fiches |
| `dispatch-inbox` | Mixed files dropped in `inbox/` — auto-routes to the right sub-skill |
| `projet-maintenir` | Create or update `PROJET.md` interactively |
| `impots-fr` | French income-tax guidance and return workflow |
| `tiime-upload-justificatifs` | Push receipt YAML metadata to Tiime |
| `revolut-attach-justificatifs` | Attach receipts to Revolut Business transactions |
| `revolut-attach-justificatifs-cli` | Same, using the `revolut` CLI for the inventory phase |
| `accountant-cli` | How to use the `accountant` CLI to validate workspace YAML |
| `revolut-cli` | How to use the `revolut` CLI to read Revolut Business data |

## Configuration

Before the first session, set the workspace path:

```bash
export ACCOUNTANT_WORKSPACE=/path/to/your/expert-accountant/workspace
```

or create `workspace.properties` at the plugin root:

```properties
ACCOUNTANT_WORKSPACE=/path/to/your/expert-accountant/workspace
```

## Tool name mapping (Claude → Gemini)

Skills are written for Claude Code. When following a skill in Gemini CLI, apply
this mapping:

| Skill instruction | Gemini action |
|---|---|
| `Read <file>` | Use the file-read tool or `cat` via shell |
| `Bash` code block | Run via the shell tool |
| `AskUserQuestion` | Ask the question directly in conversation |
| `Write <file>` | Use the file-write tool |
| `Edit <file>` | Use the file-edit tool |
| `$SKILL_DIR` | Absolute path to the skill directory (resolve from the plugin install path) |
| `$WORKSPACE` | Value of `ACCOUNTANT_WORKSPACE` (from env or `workspace.properties`) |
| `$MEMORY_DIR` | `~/.gemini/projects/<WORKSPACE-path-dashed>/memory` (Gemini project memory location — adjust to your setup) |

## MCP alternative

All skills are also available as MCP prompts via the `accountant-mcp` server.
Any MCP-compatible client (Cursor, Zed, Claude Code, Gemini with MCP plugin) can
load skills without this GEMINI.md:

```bash
# install
( cd packages/accountant-mcp && npm link )   # → accountant-mcp on $PATH

# add to your MCP client config
{
  "mcpServers": {
    "accountant-skills": {
      "command": "accountant-mcp"
    }
  }
}
```

Then call `prompts/get` with any skill name listed above.
