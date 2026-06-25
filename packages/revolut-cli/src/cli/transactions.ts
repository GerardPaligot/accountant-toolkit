import type { Command } from "commander";
import { TransactionsApi, type GetTransactionsRequest } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { paginateByWindow } from "../api/paginate.js";
import { emit, printJson, fail, globalOpts } from "./output.js";

const PAGE = 100;

export function registerTransactions(program: Command): void {
  const tx = program.command("transactions").description("Revolut transactions (read-only)");

  tx
    .command("list")
    .description("List transactions, auto-paginating the full window")
    .requiredOption("--from <iso>", "from date-time (inclusive)")
    .requiredOption("--to <iso>", "to date-time (exclusive)")
    .option("--type <type>", "transaction type filter")
    .option("--account <id>", "account id filter")
    .action(async (opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new TransactionsApi(await buildConfiguration(g.sandbox));
        const rows = await paginateByWindow<Record<string, unknown>>({
          pageSize: PAGE,
          getCursor: (t) => String(t.created_at ?? t.completed_at),
          fetchPage: async (to) => {
            const r = await api.getTransactionsRaw({
              from: opts.from,
              to: to ?? opts.to,
              count: PAGE,
              type: opts.type as GetTransactionsRequest["type"],
              account: opts.account,
            });
            return (await r.raw.json()) as Record<string, unknown>[];
          },
        });
        emit(rows, g, "transactions");
      } catch (err) {
        fail(err);
      }
    });

  tx
    .command("get <id>")
    .description("Retrieve a single transaction")
    .action(async (id, _opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new TransactionsApi(await buildConfiguration(g.sandbox));
        const r = await api.getTransactionRaw({ id });
        printJson(await r.raw.json());
      } catch (err) {
        fail(err);
      }
    });
}
