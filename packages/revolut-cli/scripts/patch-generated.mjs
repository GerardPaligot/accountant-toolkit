// Prepends `// @ts-nocheck` to every generated TypeScript file.
//
// The Revolut OpenAPI spec has schema-quality issues that OpenAPI Generator
// faithfully turns into a few broken symbols in unused models (e.g.
// NULL_SCHEMA_ERR). esbuild (build + tests) strips types and bundles fine,
// but `tsc --noEmit` reports them. We only consume a handful of models, so we
// silence type-checking inside the generated tree while keeping its exported
// types usable by our hand-written code. This runs automatically after `gen`.
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = "src/generated";
const MARKER = "// @ts-nocheck";

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith(".ts")) {
      const content = readFileSync(p, "utf8");
      if (!content.startsWith(MARKER)) {
        writeFileSync(p, `${MARKER}\n${content}`);
      }
    }
  }
}

walk(root);
console.log("patched generated client with @ts-nocheck");
