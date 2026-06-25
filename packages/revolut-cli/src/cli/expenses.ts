import type { Command } from "commander";
import { ExpensesApi, type GetExpensesRequest } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { paginateByWindow } from "../api/paginate.js";
import { emit, printJson, fail, globalOpts } from "./output.js";

const PAGE = 100;

export function registerExpenses(program: Command): void {
  const expenses = program.command("expenses").description("Revolut expenses (read-only)");

  expenses
    .command("list")
    .description("List expenses, auto-paginating the full window")
    .requiredOption("--from <iso>", "from date-time (inclusive)")
    .requiredOption("--to <iso>", "to date-time (exclusive)")
    .option("--state <state>", "filter by state, e.g. missing_info")
    .option("--type <type>", "transaction type filter")
    .action(async (opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new ExpensesApi(await buildConfiguration(g.sandbox));
        const rows = await paginateByWindow<Record<string, unknown>>({
          pageSize: PAGE,
          getCursor: (e) => String(e.expense_date ?? e.completed_at ?? e.submitted_at),
          fetchPage: async (to) => {
            const r = await api.getExpensesRaw({
              from: opts.from,
              to: to ?? opts.to,
              count: PAGE,
              state: opts.state as GetExpensesRequest["state"],
              transactionType: opts.type as GetExpensesRequest["transactionType"],
            });
            return (await r.raw.json()) as Record<string, unknown>[];
          },
        });
        emit(rows, g, "expenses");
      } catch (err) {
        fail(err);
      }
    });

  expenses
    .command("get <id>")
    .description("Retrieve a single expense")
    .action(async (id, _opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new ExpensesApi(await buildConfiguration(g.sandbox));
        const r = await api.getExpenseRaw({ expenseId: id });
        printJson(await r.raw.json());
      } catch (err) {
        fail(err);
      }
    });
}
