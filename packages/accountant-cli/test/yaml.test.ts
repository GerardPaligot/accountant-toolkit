import { describe, it, expect } from "vitest";
import { parseYaml } from "../src/yaml.js";

describe("parseYaml", () => {
  it("keeps YYYY-MM-DD values as strings (not Date)", () => {
    const d = parseYaml("date: 2026-01-20") as Record<string, unknown>;
    expect(typeof d.date).toBe("string");
    expect(d.date).toBe("2026-01-20");
  });

  it("coerces non-string keys to strings", () => {
    const d = parseYaml("2025: ok") as Record<string, unknown>;
    expect(d["2025"]).toBe("ok");
  });
});
