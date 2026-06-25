import { describe, it, expect, vi } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import type { RevolutConfig } from "../../src/auth/config.js";
import { getAccessToken, exchangeAuthCode, type CachedToken } from "../../src/auth/token.js";

const { privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
});

const cfg: RevolutConfig = {
  clientId: "cid",
  issuer: "example.com",
  privateKeyPath: "/tmp/key.pem",
  refreshToken: "refresh-1",
  redirectUri: "https://example.com/cb",
};

const readKey = () => privateKey;

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("getAccessToken", () => {
  it("reuses a cached token that is still valid (beyond the skew window)", async () => {
    const fetchImpl = vi.fn();
    const cache: CachedToken = { accessToken: "cached", expiresAt: 10_000_000 };
    const token = await getAccessToken({
      config: cfg,
      sandbox: false,
      readKey,
      readCache: () => cache,
      writeCache: () => {},
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 1_000,
    });
    expect(token).toBe("cached");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("refreshes when there is no valid cache and writes the new token", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ access_token: "fresh", expires_in: 2400 }));
    const writes: CachedToken[] = [];
    const token = await getAccessToken({
      config: cfg,
      sandbox: false,
      readKey,
      readCache: () => null,
      writeCache: (t) => writes.push(t),
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 1_000_000,
    });
    expect(token).toBe("fresh");
    expect(fetchImpl).toHaveBeenCalledOnce();
    const [, init] = fetchImpl.mock.calls[0];
    expect(String((init as RequestInit).body)).toContain("grant_type=refresh_token");
    expect(writes[0].accessToken).toBe("fresh");
    expect(writes[0].expiresAt).toBe(1_000_000 + 2400 * 1000);
  });

  it("throws a clear error when no refresh token is configured", async () => {
    await expect(
      getAccessToken({
        config: { ...cfg, refreshToken: undefined },
        sandbox: false,
        readKey,
        readCache: () => null,
        writeCache: () => {},
        fetchImpl: vi.fn() as unknown as typeof fetch,
        now: () => 1_000_000,
      }),
    ).rejects.toThrowError(/auth setup/);
  });
});

describe("exchangeAuthCode", () => {
  it("posts grant_type=authorization_code and returns the refresh token", async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ access_token: "a", refresh_token: "r", expires_in: 2400 }),
    );
    const res = await exchangeAuthCode({
      config: cfg,
      sandbox: true,
      code: "the-code",
      readKey,
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(res.refreshToken).toBe("r");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).toBe("https://sandbox-b2b.revolut.com/api/1.0/auth/token");
    expect(String((init as RequestInit).body)).toContain("grant_type=authorization_code");
    expect(String((init as RequestInit).body)).toContain("code=the-code");
  });
});
