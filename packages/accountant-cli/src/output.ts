const CODES = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

const useColor = Boolean(process.stdout.isTTY) && !process.env.NO_COLOR;

function paint(code: string, s: string): string {
  return useColor ? `${code}${s}${CODES.reset}` : s;
}

export const logOk = (msg: string): void => console.log(`${paint(CODES.green, "[OK]")}   ${msg}`);
export const logFail = (msg: string): void => console.log(`${paint(CODES.red, "[FAIL]")} ${msg}`);
export const logWarn = (msg: string): void => console.log(`${paint(CODES.yellow, "[WARN]")} ${msg}`);
export const logInfo = (msg: string): void => console.log(`${paint(CODES.cyan, "[..]")}   ${msg}`);
export const dim = (s: string): string => paint(CODES.dim, s);
