import { readFileSync } from "node:fs";
import yaml from "js-yaml";

/**
 * Recursively coerce non-string object keys to strings.
 *
 * YAML allows `2025:` (int key) or `2025-03-01:` (date-like key). JSON Schema
 * validates JSON, which only has string keys. JavaScript object keys are always
 * strings already, but we normalize defensively so `patternProperties` matching
 * behaves identically to the original Python loader.
 */
function stringifyKeys(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(stringifyKeys);
  if (node !== null && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[String(k)] = stringifyKeys(v);
    }
    return out;
  }
  return node;
}

/**
 * Parse YAML keeping `YYYY-MM-DD` values as strings (not Date objects).
 *
 * js-yaml's DEFAULT_SCHEMA resolves timestamps to `Date`, which breaks JSON
 * Schema string validation. CORE_SCHEMA (JSON-compatible types only) has no
 * timestamp type, so dates stay strings — matching the ISO 8601 convention the
 * workspace SCHEMA.md files document.
 */
export function parseYaml(content: string): unknown {
  return stringifyKeys(yaml.load(content, { schema: yaml.CORE_SCHEMA }));
}

export function loadYaml(path: string): unknown {
  return parseYaml(readFileSync(path, "utf8"));
}
