import { existsSync } from "node:fs";
import { join, basename, relative } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { loadYaml } from "./yaml.js";
import { loadManifest, findFiles } from "./manifest.js";
import { CONSISTENCY_CHECKS, type CheckError } from "./checks/consistency.js";
import { logOk, logFail, logWarn, logInfo, dim } from "./output.js";

export interface VerifyOptions {
  workspace: string;
  manifestPath: string;
  bundledSchemasDir: string;
  typeId?: string;
  strict?: boolean;
}

/** Resolve a manifest schema path: prefer the workspace copy, fall back to the bundled one. */
function resolveSchemaPath(opts: VerifyOptions, schemaRel: string): string | null {
  const inWorkspace = join(opts.workspace, schemaRel);
  if (existsSync(inWorkspace)) return inWorkspace;
  const bundled = join(opts.bundledSchemasDir, basename(schemaRel));
  if (existsSync(bundled)) return bundled;
  return null;
}

function validateAgainstSchema(filePath: string, schema: object): string[] {
  let data: unknown;
  try {
    data = loadYaml(filePath);
  } catch (e) {
    return [`invalid YAML: ${(e as Error).message}`];
  }
  // Match the original Python (Draft202012Validator without a format checker):
  // collect all errors, do not enforce string formats.
  const ajv = new Ajv2020({ allErrors: true, strict: false, validateFormats: false });
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (e) {
    return [`invalid schema: ${(e as Error).message}`];
  }
  if (validate(data)) return [];
  return (validate.errors ?? [])
    .map((err) => `${err.instancePath || "/"}: ${err.message}`)
    .sort();
}

const PAD = 28;

/** Port of `.script/verify.py`: schema validation (pass 1) then consistency checks (pass 2). */
export function verify(opts: VerifyOptions): number {
  const manifest = loadManifest(opts.manifestPath);
  const allEntries = manifest.meta_documents ?? [];

  if (opts.typeId && !allEntries.some((e) => e.id === opts.typeId)) {
    logFail(`No entry with id=${opts.typeId}`);
    return 1;
  }

  // Always scan every entry: a consistency check may reference an id other than --type.
  const filesById: Record<string, string[]> = {};
  for (const e of allEntries) {
    if (e.type === "index" || e.type === "document") filesById[e.id] = findFiles(opts.workspace, e);
  }

  const entries = opts.typeId ? allEntries.filter((e) => e.id === opts.typeId) : allEntries;
  const pad = (s: string) => s.padEnd(PAD);
  let totalFiles = 0;
  let totalErrors = 0;

  // Pass 1 — schema validation
  for (const entry of entries) {
    if (entry.type !== "index" && entry.type !== "document") continue;
    const files = filesById[entry.id] ?? [];

    if (!entry.schema) {
      logInfo(`${pad(entry.id)} → ${files.length} file(s), no schema declared`);
      continue;
    }
    const schemaPath = resolveSchemaPath(opts, entry.schema);
    if (!schemaPath) {
      logFail(`${pad(entry.id)} → schema missing: ${entry.schema}`);
      totalErrors++;
      continue;
    }
    let schema: object;
    try {
      schema = loadYaml(schemaPath) as object;
    } catch (e) {
      logFail(`${pad(entry.id)} → invalid schema YAML (${entry.schema}): ${(e as Error).message}`);
      totalErrors++;
      continue;
    }
    if (files.length === 0) {
      logWarn(`${pad(entry.id)} → no file found for the pattern`);
      continue;
    }

    const fileErrors: { file: string; errs: string[] }[] = [];
    for (const fp of files) {
      const errs = validateAgainstSchema(fp, schema);
      if (errs.length) fileErrors.push({ file: fp, errs });
    }
    totalFiles += files.length;

    if (fileErrors.length) {
      logFail(`${pad(entry.id)} → ${files.length} file(s), ${fileErrors.length} in error`);
      for (const fe of fileErrors) {
        const rel = relative(opts.workspace, fe.file);
        for (const err of fe.errs) {
          console.log(`       ${dim(rel)} ${err}`);
          totalErrors++;
        }
      }
    } else {
      logOk(`${pad(entry.id)} → ${files.length} file(s), schema OK`);
    }
  }

  // Pass 2 — consistency checks
  for (const entry of entries) {
    for (const check of entry.consistency_checks ?? []) {
      const fn = CONSISTENCY_CHECKS[check.id];
      const label = `${check.id} (${entry.id})`;
      if (!fn) {
        logFail(`unknown check: ${check.id} (on ${entry.id})`);
        totalErrors++;
        continue;
      }
      const errors: CheckError[] = fn(opts.workspace, entry, check.args ?? {}, filesById);
      if (errors.length) {
        logFail(`${label} → ${errors.length} inconsistency(ies)`);
        for (const e of errors) console.log(`       ${dim(`${e.file}: ${e.message}`)}`);
        totalErrors += errors.length;
      } else {
        logOk(label);
      }
    }
  }

  console.log();
  if (totalErrors === 0) {
    logOk(`Summary: ${totalFiles} file(s) validated, 0 error.`);
    return 0;
  }
  logFail(`Summary: ${totalFiles} file(s) validated, ${totalErrors} error(s).`);
  return Math.min(totalErrors, 255);
}
