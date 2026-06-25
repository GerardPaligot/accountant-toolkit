import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { Configuration } from "../generated/index.js";
import { loadConfig, apiBase, tokenCachePath, configDir } from "../auth/config.js";
import { getAccessToken, type CachedToken } from "../auth/token.js";

function readCache(): CachedToken | null {
  const p = tokenCachePath();
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as CachedToken;
  } catch {
    return null;
  }
}

function writeCache(t: CachedToken): void {
  const p = tokenCachePath();
  if (!existsSync(configDir())) mkdirSync(dirname(p), { recursive: true, mode: 0o700 });
  writeFileSync(p, JSON.stringify(t), { mode: 0o600 });
}

export async function buildConfiguration(sandbox: boolean): Promise<Configuration> {
  const config = loadConfig();
  return new Configuration({
    basePath: apiBase(sandbox),
    accessToken: async () =>
      getAccessToken({
        config,
        sandbox,
        readKey: (path) => readFileSync(path, "utf8"),
        readCache,
        writeCache,
      }),
  });
}
