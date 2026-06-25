import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { findFiles } from "../src/manifest.js";

let ws: string;

beforeAll(() => {
  ws = mkdtempSync(join(tmpdir(), "accountant-manifest-"));
  mkdirSync(join(ws, "receipts", "2026-01"), { recursive: true });
  writeFileSync(join(ws, "receipts", "2026-01", "a.yaml"), "x: 1");
  writeFileSync(join(ws, "receipts", "2026-01", "_skip.yaml"), "x: 1");
  writeFileSync(join(ws, "receipts", "_index.yaml"), "x: 1");
});

afterAll(() => rmSync(ws, { recursive: true, force: true }));

describe("findFiles", () => {
  it("resolves a single existing `path` entry", () => {
    const files = findFiles(ws, { id: "i", type: "index", path: "receipts/_index.yaml" });
    expect(files).toHaveLength(1);
    expect(files[0].endsWith("/receipts/_index.yaml")).toBe(true);
  });

  it("returns [] for a missing `path`", () => {
    expect(findFiles(ws, { id: "i", path: "nope.yaml" })).toEqual([]);
  });

  it("matches `path_pattern` and excludes underscore-prefixed files", () => {
    const files = findFiles(ws, {
      id: "r",
      type: "document",
      path_pattern: String.raw`^receipts/\d{4}-\d{2}/[^_][^/]*\.yaml$`,
    });
    expect(files).toHaveLength(1);
    expect(files[0].endsWith("/2026-01/a.yaml")).toBe(true);
  });
});
