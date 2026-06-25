import { describe, it, expect } from "vitest";
import { Configuration, ExpensesApi, TransactionsApi } from "../src/generated/index.js";

describe("generated client", () => {
  it("exposes the API classes we depend on", () => {
    const cfg = new Configuration({ basePath: "https://example.test" });
    expect(typeof ExpensesApi).toBe("function");
    expect(typeof TransactionsApi).toBe("function");
    const api = new ExpensesApi(cfg);
    expect(typeof (api as unknown as { getExpensesRaw: unknown }).getExpensesRaw).toBe("function");
  });
});
