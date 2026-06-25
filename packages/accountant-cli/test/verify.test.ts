import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { verify } from "../src/verify.js";

const SCHEMA = `$schema: https://json-schema.org/draft/2020-12/schema
$id: thing.schema.yaml
type: object
required: [name]
additionalProperties: true
properties:
  name: { type: string }
`;

const MANIFEST = `meta_documents:
  - id: thing
    type: document
    path_pattern: '^data/[^_][^/]*\\.yaml$'
    schema: .schemas/thing.schema.yaml
`;

let ws: string;

beforeEach(() => {
  ws = mkdtempSync(join(tmpdir(), "accountant-verify-"));
  mkdirSync(join(ws, "data"), { recursive: true });
  mkdirSync(join(ws, ".schemas"), { recursive: true });
  writeFileSync(join(ws, "_meta_docs.yaml"), MANIFEST);
  writeFileSync(join(ws, ".schemas", "thing.schema.yaml"), SCHEMA);
  vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
  rmSync(ws, { recursive: true, force: true });
  vi.restoreAllMocks();
});

function opts(extra: Record<string, unknown> = {}) {
  return {
    workspace: ws,
    manifestPath: join(ws, "_meta_docs.yaml"),
    bundledSchemasDir: join(ws, ".schemas"),
    ...extra,
  };
}

describe("verify", () => {
  it("returns 0 when every file matches its schema", () => {
    writeFileSync(join(ws, "data", "good.yaml"), "name: ok");
    expect(verify(opts())).toBe(0);
  });

  it("returns nonzero when a file violates its schema", () => {
    writeFileSync(join(ws, "data", "bad.yaml"), "value: 1"); // missing required `name`
    expect(verify(opts())).toBeGreaterThan(0);
  });

  it("falls back to the bundled schema when the workspace lacks it", () => {
    rmSync(join(ws, ".schemas", "thing.schema.yaml"));
    const bundled = mkdtempSync(join(tmpdir(), "accountant-bundled-"));
    writeFileSync(join(bundled, "thing.schema.yaml"), SCHEMA);
    writeFileSync(join(ws, "data", "good.yaml"), "name: ok");
    expect(verify(opts({ bundledSchemasDir: bundled }))).toBe(0);
    rmSync(bundled, { recursive: true, force: true });
  });

  it("fails on an unknown manifest --type", () => {
    expect(verify(opts({ typeId: "nope" }))).toBe(1);
  });
});
