import type { Command } from "commander";
import { AccountsApi, AccountingCategoriesApi, TaxRatesApi } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { emit, fail, globalOpts } from "./output.js";

export function registerReference(program: Command): void {
  program
    .command("accounts")
    .description("List accounts")
    .command("list")
    .action(async (_opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new AccountsApi(await buildConfiguration(g.sandbox));
        const r = await api.getAccountsRaw();
        const rows = (await r.raw.json()) as Record<string, unknown>[];
        emit(rows, g, "accounts");
      } catch (err) {
        fail(err);
      }
    });

  program
    .command("categories")
    .description("List accounting categories")
    .command("list")
    .action(async (_opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new AccountingCategoriesApi(await buildConfiguration(g.sandbox));
        const r = await api.getAccountingCategoriesRaw({});
        const body = (await r.raw.json()) as { accounting_categories?: Record<string, unknown>[] };
        emit(body.accounting_categories ?? [], g, "accounting_categories");
      } catch (err) {
        fail(err);
      }
    });

  program
    .command("tax-rates")
    .description("List tax rates")
    .command("list")
    .action(async (_opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new TaxRatesApi(await buildConfiguration(g.sandbox));
        const r = await api.getTaxRatesRaw({});
        const body = (await r.raw.json()) as { tax_rates?: Record<string, unknown>[] };
        emit(body.tax_rates ?? [], g, "tax_rates");
      } catch (err) {
        fail(err);
      }
    });
}
