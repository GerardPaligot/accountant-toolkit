import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";

function resolveSkillsDir(): string {
  const argIdx = process.argv.indexOf("--skills-dir");
  if (argIdx !== -1 && process.argv[argIdx + 1]) {
    return resolve(process.argv[argIdx + 1]);
  }
  if (process.env.ACCOUNTANT_SKILLS_DIR) {
    return resolve(process.env.ACCOUNTANT_SKILLS_DIR);
  }
  // Default: repo checkout layout — dist/ → pkg/ → packages/ → root → plugins/accountant/skills
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, "../../../plugins/accountant/skills");
}

interface Skill {
  name: string;
  description: string;
  content: string;
}

function parseFrontmatter(raw: string): { name: string; description: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { name: "", description: "" };
  const fm = match[1];
  const name = fm.match(/^name:\s*(.+)$/m)?.[1]?.trim() ?? "";
  // description may be a long single line
  const description = fm.match(/^description:\s*(.+)$/m)?.[1]?.trim() ?? "";
  return { name, description };
}

function loadSkills(skillsDir: string): Skill[] {
  if (!existsSync(skillsDir)) {
    process.stderr.write(`accountant-mcp: skills dir not found: ${skillsDir}\n`);
    return [];
  }
  const skills: Skill[] = [];
  for (const entry of readdirSync(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const skillPath = join(skillsDir, entry.name, "SKILL.md");
    if (!existsSync(skillPath)) continue;
    const content = readFileSync(skillPath, "utf-8");
    const { name, description } = parseFrontmatter(content);
    skills.push({ name: name || entry.name, description, content });
  }
  return skills;
}

const skillsDir = resolveSkillsDir();
const skills = loadSkills(skillsDir);
const byName = new Map(skills.map((s) => [s.name, s]));

const server = new Server(
  { name: "accountant-skills", version: "1.0.0" },
  { capabilities: { prompts: {} } }
);

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: skills.map((s) => ({ name: s.name, description: s.description })),
}));

server.setRequestHandler(GetPromptRequestSchema, async (req) => {
  const skill = byName.get(req.params.name);
  if (!skill) throw new Error(`Unknown skill: ${req.params.name}`);
  return {
    description: skill.description,
    messages: [
      { role: "user" as const, content: { type: "text" as const, text: skill.content } },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
