import { existsSync, readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { loadYaml } from "./yaml.js";

export interface ConsistencyCheck {
  id: string;
  args?: Record<string, unknown>;
}

export interface MetaEntry {
  id: string;
  type?: string;
  path?: string;
  path_pattern?: string;
  schema?: string;
  consistency_checks?: ConsistencyCheck[];
}

export interface Manifest {
  meta_documents?: MetaEntry[];
}

export function loadManifest(manifestPath: string): Manifest {
  return (loadYaml(manifestPath) as Manifest) ?? {};
}

const IGNORE_DIRS = new Set(["node_modules", ".git"]);

function walkYaml(root: string): string[] {
  const out: string[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const e of entries) {
      if (e.isDirectory()) {
        if (!IGNORE_DIRS.has(e.name)) stack.push(join(dir, e.name));
      } else if (e.isFile() && e.name.endsWith(".yaml")) {
        out.push(join(dir, e.name));
      }
    }
  }
  return out;
}

function toPosix(p: string): string {
  return p.split(sep).join("/");
}

/**
 * Return the absolute paths matched by a manifest entry.
 * - `path`: a single workspace-relative file (if it exists).
 * - `path_pattern`: a regex (Python `re.match` semantics; the manifest patterns
 *   are anchored with `^`) applied to the workspace-relative POSIX path of every
 *   `*.yaml` under the workspace.
 */
export function findFiles(workspace: string, entry: MetaEntry): string[] {
  if (entry.path) {
    const p = join(workspace, entry.path);
    return existsSync(p) ? [p] : [];
  }
  if (!entry.path_pattern) return [];
  const regex = new RegExp(entry.path_pattern);
  const results: string[] = [];
  for (const abs of walkYaml(workspace)) {
    const rel = toPosix(relative(workspace, abs));
    if (regex.test(rel)) results.push(abs);
  }
  return results.sort();
}
