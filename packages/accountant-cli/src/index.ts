import { Command } from "commander";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { verify } from "./verify.js";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(here, "..");
const BUNDLED_SCHEMAS_DIR = join(pkgRoot, "schemas");
const BUNDLED_MANIFEST = join(pkgRoot, "meta-docs.yaml");

/** Pick the manifest: explicit flag → workspace's own → bundled default. */
function resolveManifest(workspace: string, explicit?: string): string {
  if (explicit) return resolve(explicit);
  const inWorkspace = join(workspace, "_meta_docs.yaml");
  if (existsSync(inWorkspace)) return inWorkspace;
  return BUNDLED_MANIFEST;
}

const program = new Command();
program.name("accountant").description("Validate and manage an accountant workspace's YAML files");

program
  .command("verify")
  .description("Validate workspace YAML against the schemas declared in the manifest")
  .option("--workspace <dir>", "workspace root to validate", process.cwd())
  .option("--manifest <path>", "manifest file (default: <workspace>/_meta_docs.yaml, else bundled)")
  .option("--type <id>", "target a single manifest entry by id")
  .option("--strict", "treat warnings as errors", false)
  .action((opts: { workspace: string; manifest?: string; type?: string; strict?: boolean }) => {
    const workspace = resolve(opts.workspace);
    const manifestPath = resolveManifest(workspace, opts.manifest);
    if (!existsSync(manifestPath)) {
      console.error(`error: manifest not found: ${manifestPath}`);
      process.exit(1);
    }
    const code = verify({
      workspace,
      manifestPath,
      bundledSchemasDir: BUNDLED_SCHEMAS_DIR,
      typeId: opts.type,
      strict: opts.strict,
    });
    process.exit(code);
  });

program.parseAsync(process.argv);
