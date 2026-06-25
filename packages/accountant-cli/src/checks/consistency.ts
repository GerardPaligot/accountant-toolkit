import { existsSync } from "node:fs";
import { isAbsolute, resolve, relative, dirname } from "node:path";
import { loadYaml } from "../yaml.js";
import type { MetaEntry } from "../manifest.js";

export interface CheckError {
  file: string;
  message: string;
}

export type CheckArgs = Record<string, unknown>;
export type CheckFn = (
  workspace: string,
  entry: MetaEntry,
  args: CheckArgs,
  filesById: Record<string, string[]>,
) => CheckError[];

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Walk a dot-path with `*` wildcard (dicts/lists) and collect `field` values from the final lists. */
function walk(node: unknown, parts: string[], field: string, out: string[]): void {
  if (parts.length === 0) {
    if (Array.isArray(node)) {
      for (const item of node) {
        if (isRecord(item) && typeof item[field] === "string") out.push(item[field] as string);
      }
    }
    return;
  }
  const [head, ...tail] = parts;
  if (head === "*") {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, tail, field, out);
    } else if (isRecord(node)) {
      for (const value of Object.values(node)) walk(value, tail, field, out);
    }
  } else if (isRecord(node) && head in node) {
    walk(node[head], tail, field, out);
  }
}

function collectReferencedPaths(data: unknown, dotPath: string, field: string): string[] {
  const out: string[] = [];
  walk(data, dotPath.split("."), field, out);
  return out;
}

/**
 * Resolve a path referenced in an index. May be absolute, relative to the
 * workspace root, or relative to the index's own folder.
 */
function resolveAgainst(workspace: string, indexPath: string, ref: string): string {
  if (isAbsolute(ref)) return resolve(ref);
  const viaWorkspace = resolve(workspace, ref);
  if (existsSync(viaWorkspace)) return viaWorkspace;
  return resolve(dirname(indexPath), ref);
}

function toRel(workspace: string, p: string): string {
  const r = relative(workspace, p);
  return r.startsWith("..") ? p : r;
}

/** Verify every source document is referenced in the index, and vice-versa. */
export const indexAggregatesDocuments: CheckFn = (workspace, entry, args, filesById) => {
  const documentsId = String(args.documents_id);
  const indexListPath = String(args.index_list_path);
  const documentField = typeof args.document_field === "string" ? args.document_field : "file";

  const indexFiles = filesById[entry.id] ?? [];
  const documentFiles = filesById[documentsId] ?? [];
  const errors: CheckError[] = [];

  if (indexFiles.length === 0) {
    return [{ file: entry.id, message: "no index file found for this check" }];
  }

  for (const indexPath of indexFiles) {
    let indexData: unknown;
    try {
      indexData = loadYaml(indexPath);
    } catch (e) {
      errors.push({ file: indexPath, message: `invalid YAML: ${(e as Error).message}` });
      continue;
    }

    const referenced = collectReferencedPaths(indexData, indexListPath, documentField);
    const referencedResolved = new Set(referenced.map((ref) => resolveAgainst(workspace, indexPath, ref)));
    const documentsSet = new Set(documentFiles.map((p) => resolve(p)));

    const missing = [...documentsSet].filter((d) => !referencedResolved.has(d)).sort();
    const extra = [...referencedResolved].filter((r) => !documentsSet.has(r)).sort();

    for (const m of missing) {
      errors.push({
        file: toRel(workspace, indexPath),
        message: `document not referenced in the index: ${toRel(workspace, m)}`,
      });
    }
    for (const x of extra) {
      errors.push({
        file: toRel(workspace, indexPath),
        message: `index reference without a source document: ${toRel(workspace, x)}`,
      });
    }
  }

  return errors;
};

export const CONSISTENCY_CHECKS: Record<string, CheckFn> = {
  index_aggregates_documents: indexAggregatesDocuments,
};
