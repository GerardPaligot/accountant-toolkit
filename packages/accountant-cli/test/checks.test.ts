import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { indexAggregatesDocuments } from "../src/checks/consistency.js";

let ws: string;
let indexPath: string;
const args = { documents_id: "doc", index_list_path: "topics", document_field: "path" };
const entry = { id: "idx", path: "index.yaml" };

beforeEach(() => {
  ws = mkdtempSync(join(tmpdir(), "accountant-checks-"));
  indexPath = join(ws, "index.yaml");
});
afterEach(() => rmSync(ws, { recursive: true, force: true }));

describe("indexAggregatesDocuments", () => {
  it("passes when the index references exactly the documents", () => {
    const a = join(ws, "a.yaml");
    const b = join(ws, "b.yaml");
    writeFileSync(a, "x: 1");
    writeFileSync(b, "x: 1");
    writeFileSync(indexPath, "topics:\n  - path: a.yaml\n  - path: b.yaml\n");
    const errs = indexAggregatesDocuments(ws, entry, args, { idx: [indexPath], doc: [a, b] });
    expect(errs).toEqual([]);
  });

  it("flags a document missing from the index", () => {
    const a = join(ws, "a.yaml");
    const b = join(ws, "b.yaml");
    writeFileSync(a, "x: 1");
    writeFileSync(b, "x: 1");
    writeFileSync(indexPath, "topics:\n  - path: a.yaml\n");
    const errs = indexAggregatesDocuments(ws, entry, args, { idx: [indexPath], doc: [a, b] });
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toContain("document not referenced in the index");
  });

  it("flags an index reference without a source document", () => {
    const a = join(ws, "a.yaml");
    writeFileSync(a, "x: 1");
    writeFileSync(indexPath, "topics:\n  - path: a.yaml\n  - path: ghost.yaml\n");
    const errs = indexAggregatesDocuments(ws, entry, args, { idx: [indexPath], doc: [a] });
    expect(errs).toHaveLength(1);
    expect(errs[0].message).toContain("index reference without a source document");
  });
});
