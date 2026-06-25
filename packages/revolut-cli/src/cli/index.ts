import { Command } from "commander";
import { registerExpenses } from "./expenses.js";
import { registerTransactions } from "./transactions.js";
import { registerReceipts } from "./receipts.js";
import { registerReference } from "./reference.js";
import { registerAuth } from "./auth.js";

const program = new Command();
program
  .name("revolut")
  .description("Read-only CLI over the Revolut Business API")
  .option("--sandbox", "use the sandbox environment", false)
  .option("--pretty", "render a human table instead of JSON", false);

registerAuth(program);
registerExpenses(program);
registerTransactions(program);
registerReceipts(program);
registerReference(program);

program.parseAsync(process.argv);
