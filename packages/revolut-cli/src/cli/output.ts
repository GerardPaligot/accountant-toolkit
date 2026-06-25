import type { Command } from "commander";

export function printJson(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function printTable(rows: Record<string, unknown>[]): void {
  console.table(rows);
}

export function emit(data: Record<string, unknown>[], opts: { pretty: boolean }, wrapKey: string): void {
  if (opts.pretty) {
    printTable(data);
  } else {
    printJson({ [wrapKey]: data });
  }
}

export function fail(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

export function globalOpts(cmd: Command): { sandbox: boolean; pretty: boolean } {
  const o = cmd.optsWithGlobals<{ sandbox?: boolean; pretty?: boolean }>();
  return { sandbox: Boolean(o.sandbox), pretty: Boolean(o.pretty) };
}
