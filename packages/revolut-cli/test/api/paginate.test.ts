import { describe, it, expect, vi } from "vitest";
import { paginateByWindow } from "../../src/api/paginate.js";

interface Row {
  id: string;
  created_at: string;
}

describe("paginateByWindow", () => {
  it("stops on a short page and returns all items", async () => {
    const pages: Row[][] = [
      [
        { id: "a", created_at: "2026-01-10T00:00:00Z" },
        { id: "b", created_at: "2026-01-09T00:00:00Z" },
      ],
      [{ id: "c", created_at: "2026-01-08T00:00:00Z" }],
    ];
    const fetchPage = vi.fn(async () => pages.shift() ?? []);
    const all = await paginateByWindow<Row>({
      fetchPage,
      getCursor: (r) => r.created_at,
      pageSize: 2,
    });
    expect(all.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("passes the oldest cursor of a full page as the next `to`", async () => {
    const pages: Row[][] = [
      [
        { id: "a", created_at: "2026-01-10T00:00:00.000Z" },
        { id: "b", created_at: "2026-01-09T00:00:00.000Z" },
      ],
      [],
    ];
    const seenTo: (string | undefined)[] = [];
    const fetchPage = vi.fn(async (to?: string) => {
      seenTo.push(to);
      return pages.shift() ?? [];
    });
    await paginateByWindow<Row>({ fetchPage, getCursor: (r) => r.created_at, pageSize: 2 });
    expect(seenTo[0]).toBeUndefined();
    expect(seenTo[1]).toBe("2026-01-08T23:59:59.999Z");
  });

  it("honors hardLimit", async () => {
    const fetchPage = vi.fn(async () => [
      { id: "x", created_at: "2026-01-10T00:00:00Z" },
      { id: "y", created_at: "2026-01-09T00:00:00Z" },
    ]);
    const all = await paginateByWindow<Row>({
      fetchPage,
      getCursor: (r) => r.created_at,
      pageSize: 2,
      hardLimit: 3,
    });
    expect(all.length).toBeLessThanOrEqual(4);
    expect(fetchPage.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
