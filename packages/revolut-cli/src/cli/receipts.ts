import type { Command } from "commander";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ExpensesApi } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { fail, globalOpts, printJson } from "./output.js";

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function extFor(contentType: string | null): string {
  if (!contentType) return "bin";
  const base = contentType.split(";")[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] ?? "bin";
}

export function registerReceipts(program: Command): void {
  program
    .command("receipts")
    .description("Download receipts attached to an expense")
    .command("download <expenseId>")
    .requiredOption("--out <dir>", "output directory")
    .option("--receipt <id>", "download only this receipt id")
    .action(async (expenseId, opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new ExpensesApi(await buildConfiguration(g.sandbox));
        const er = await api.getExpenseRaw({ expenseId });
        const expense = (await er.raw.json()) as { receipt_ids?: string[] };
        const ids = opts.receipt ? [opts.receipt] : expense.receipt_ids ?? [];
        if (ids.length === 0) {
          printJson({ downloaded: [], note: "expense has no receipts" });
          return;
        }
        mkdirSync(opts.out, { recursive: true });
        const downloaded: string[] = [];
        for (const receiptId of ids) {
          const raw = await api.getExpenseReceiptRaw({ expenseId, receiptId });
          const res = raw.raw; // underlying fetch Response
          const buf = Buffer.from(await res.arrayBuffer());
          const ext = extFor(res.headers.get("content-type"));
          const path = join(opts.out, `${expenseId}_${receiptId}.${ext}`);
          writeFileSync(path, buf);
          downloaded.push(path);
        }
        printJson({ downloaded });
      } catch (err) {
        fail(err);
      }
    });
}
