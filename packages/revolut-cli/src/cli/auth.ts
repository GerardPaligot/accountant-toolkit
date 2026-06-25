import type { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { readFileSync, existsSync } from "node:fs";
import { loadConfig, saveConfig, apiBase, tokenCachePath, type RevolutConfig } from "../auth/config.js";
import { exchangeAuthCode, type CachedToken } from "../auth/token.js";
import { fail, printJson, globalOpts } from "./output.js";

function authorizeUrl(cfg: RevolutConfig): string {
  const u = new URL("https://business.revolut.com/app-confirm");
  u.searchParams.set("client_id", cfg.clientId);
  u.searchParams.set("redirect_uri", cfg.redirectUri);
  u.searchParams.set("response_type", "code");
  return u.toString();
}

export function registerAuth(program: Command): void {
  const auth = program.command("auth").description("Authentication");

  auth
    .command("setup")
    .description("One-time OAuth consent: exchange an authorization code for a refresh token")
    .action(async (_opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const cfg = loadConfig();
        process.stderr.write(
          `Open this URL, authorize, then paste the \`code\` from the redirect:\n${authorizeUrl(cfg)}\n`,
        );
        const rl = createInterface({ input: process.stdin, output: process.stderr });
        const code = (await rl.question("code: ")).trim();
        rl.close();
        const res = await exchangeAuthCode({
          config: cfg,
          sandbox: g.sandbox,
          code,
          readKey: (path) => readFileSync(path, "utf8"),
        });
        saveConfig({ ...cfg, refreshToken: res.refreshToken });
        printJson({ ok: true, stored: tokenCachePath(), note: "refresh token saved to config" });
      } catch (err) {
        fail(err);
      }
    });

  auth
    .command("status")
    .description("Report cached access-token validity (no secrets printed)")
    .action(async (_opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const cfg = loadConfig();
        const p = tokenCachePath();
        let token: CachedToken | null = null;
        if (existsSync(p)) token = JSON.parse(readFileSync(p, "utf8")) as CachedToken;
        printJson({
          clientId: cfg.clientId,
          base: apiBase(g.sandbox),
          hasRefreshToken: Boolean(cfg.refreshToken),
          accessTokenValid: token ? token.expiresAt > Date.now() : false,
          expiresAt: token ? new Date(token.expiresAt).toISOString() : null,
        });
      } catch (err) {
        fail(err);
      }
    });
}
