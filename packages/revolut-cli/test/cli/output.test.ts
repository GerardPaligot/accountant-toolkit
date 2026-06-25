import { describe, it, expect, vi, afterEach } from "vitest";
import { emit, fail } from "../../src/cli/output.js";

afterEach(() => vi.restoreAllMocks());

describe("emit", () => {
  it("writes wrapped JSON to stdout when not pretty", () => {
    const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    emit([{ id: "1" }], { pretty: false }, "expenses");
    const written = spy.mock.calls[0][0] as string;
    expect(JSON.parse(written)).toEqual({ expenses: [{ id: "1" }] });
  });
});

describe("fail", () => {
  it("writes to stderr and exits nonzero", () => {
    const errSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((): never => {
      throw new Error("exit");
    }) as never);
    expect(() => fail(new Error("boom"))).toThrowError("exit");
    expect(String(errSpy.mock.calls[0][0])).toContain("boom");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
