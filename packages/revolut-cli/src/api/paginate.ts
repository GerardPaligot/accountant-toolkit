export async function paginateByWindow<T>(opts: {
  fetchPage: (to?: string) => Promise<T[]>;
  getCursor: (item: T) => string;
  pageSize: number;
  hardLimit?: number;
}): Promise<T[]> {
  const all: T[] = [];
  let to: string | undefined = undefined;
  while (true) {
    const page = await opts.fetchPage(to);
    all.push(...page);
    if (page.length < opts.pageSize) break;
    if (opts.hardLimit !== undefined && all.length >= opts.hardLimit) break;
    const oldest = page[page.length - 1];
    const t = new Date(opts.getCursor(oldest)).getTime() - 1;
    to = new Date(t).toISOString();
  }
  return all;
}
