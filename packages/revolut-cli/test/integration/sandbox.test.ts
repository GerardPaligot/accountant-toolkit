import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

const run = process.env.REVOLUT_SANDBOX_IT === "1";

describe.skipIf(!run)("sandbox integration", () => {
  it("lists expenses as JSON", () => {
    const out = execFileSync(
      "npx",
      ["tsx", "src/cli/index.ts", "--sandbox", "expenses", "list", "--from", "2020-01-01", "--to", "2030-01-01"],
      { encoding: "utf8" },
    );
    const parsed = JSON.parse(out) as { expenses: unknown[] };
    expect(Array.isArray(parsed.expenses)).toBe(true);
  });
});
