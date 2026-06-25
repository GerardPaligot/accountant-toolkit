import type { RevolutConfig } from "./config.js";
import { apiBase } from "./config.js";
import { signClientAssertion } from "./jwt.js";

const ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
const SKEW_MS = 60_000; // treat token as expired 60s early

export interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

interface TokenSeams {
  config: RevolutConfig;
  sandbox: boolean;
  readKey: (path: string) => string;
  fetchImpl?: typeof fetch;
  now?: () => number;
}

function tokenUrl(sandbox: boolean): string {
  return `${apiBase(sandbox)}/auth/token`;
}

async function postToken(
  body: URLSearchParams,
  sandbox: boolean,
  fetchImpl: typeof fetch,
): Promise<{ access_token: string; refresh_token?: string; expires_in: number }> {
  const res = await fetchImpl(tokenUrl(sandbox), {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }
  return (await res.json()) as { access_token: string; refresh_token?: string; expires_in: number };
}

export async function getAccessToken(
  opts: TokenSeams & {
    readCache: () => CachedToken | null;
    writeCache: (t: CachedToken) => void;
  },
): Promise<string> {
  const now = opts.now ?? Date.now;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const cached = opts.readCache();
  if (cached && cached.expiresAt - SKEW_MS > now()) {
    return cached.accessToken;
  }
  if (!opts.config.refreshToken) {
    throw new Error("No refresh token configured. Run `revolut auth setup` first.");
  }
  const assertion = signClientAssertion({
    clientId: opts.config.clientId,
    issuer: opts.config.issuer,
    privateKeyPem: opts.readKey(opts.config.privateKeyPath),
    now: Math.floor(now() / 1000),
  });
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: opts.config.refreshToken,
    client_id: opts.config.clientId,
    client_assertion_type: ASSERTION_TYPE,
    client_assertion: assertion,
  });
  const json = await postToken(body, opts.sandbox, fetchImpl);
  const token: CachedToken = {
    accessToken: json.access_token,
    expiresAt: now() + json.expires_in * 1000,
  };
  opts.writeCache(token);
  return token.accessToken;
}

export async function exchangeAuthCode(
  opts: TokenSeams & { code: string },
): Promise<{ refreshToken: string; accessToken: string; expiresIn: number }> {
  const now = opts.now ?? Date.now;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const assertion = signClientAssertion({
    clientId: opts.config.clientId,
    issuer: opts.config.issuer,
    privateKeyPem: opts.readKey(opts.config.privateKeyPath),
    now: Math.floor(now() / 1000),
  });
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: opts.code,
    redirect_uri: opts.config.redirectUri,
    client_id: opts.config.clientId,
    client_assertion_type: ASSERTION_TYPE,
    client_assertion: assertion,
  });
  const json = await postToken(body, opts.sandbox, fetchImpl);
  if (!json.refresh_token) {
    throw new Error("Authorization code exchange did not return a refresh_token.");
  }
  return { refreshToken: json.refresh_token, accessToken: json.access_token, expiresIn: json.expires_in };
}
