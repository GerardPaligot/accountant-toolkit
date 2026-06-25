import { homedir } from "node:os";
import { join } from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

export interface RevolutConfig {
  clientId: string;
  issuer: string;
  privateKeyPath: string;
  refreshToken?: string;
  redirectUri: string;
}

const PROD = "https://b2b.revolut.com/api/1.0";
const SANDBOX = "https://sandbox-b2b.revolut.com/api/1.0";

export function apiBase(sandbox: boolean): string {
  return sandbox ? SANDBOX : PROD;
}

export function configDir(): string {
  return process.env.REVOLUT_CONFIG_DIR ?? join(homedir(), ".config", "revolut-cli");
}

export function tokenCachePath(): string {
  return join(configDir(), "token.json");
}

function configFilePath(): string {
  return join(configDir(), "config.json");
}

function readFileConfig(): Partial<RevolutConfig> {
  const p = configFilePath();
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf8")) as Partial<RevolutConfig>;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): RevolutConfig {
  const file = readFileConfig();
  const merged: Partial<RevolutConfig> = {
    clientId: env.REVOLUT_CLIENT_ID ?? file.clientId,
    issuer: env.REVOLUT_ISSUER ?? file.issuer,
    privateKeyPath: env.REVOLUT_PRIVATE_KEY ?? file.privateKeyPath,
    refreshToken: env.REVOLUT_REFRESH_TOKEN ?? file.refreshToken,
    redirectUri: env.REVOLUT_REDIRECT_URI ?? file.redirectUri,
  };
  const required: (keyof RevolutConfig)[] = ["clientId", "issuer", "privateKeyPath", "redirectUri"];
  const missing = required.filter((k) => !merged[k]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required config: ${missing.join(", ")}. ` +
        `Set them via env (REVOLUT_*) or run \`revolut auth setup\`.`,
    );
  }
  return merged as RevolutConfig;
}

export function saveConfig(cfg: RevolutConfig): void {
  const dir = configDir();
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 });
  writeFileSync(configFilePath(), JSON.stringify(cfg, null, 2), { mode: 0o600 });
}
