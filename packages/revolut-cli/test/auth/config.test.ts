import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { apiBase, loadConfig } from "../../src/auth/config.js";

// Isolate from any real ~/.config/revolut-cli/config.json on this machine.
let dir: string;
const prev = process.env.REVOLUT_CONFIG_DIR;

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "revolut-cli-test-"));
  process.env.REVOLUT_CONFIG_DIR = dir;
});

afterAll(() => {
  if (prev === undefined) delete process.env.REVOLUT_CONFIG_DIR;
  else process.env.REVOLUT_CONFIG_DIR = prev;
  rmSync(dir, { recursive: true, force: true });
});

describe("apiBase", () => {
  it("returns prod by default and sandbox when asked", () => {
    expect(apiBase(false)).toBe("https://b2b.revolut.com/api/1.0");
    expect(apiBase(true)).toBe("https://sandbox-b2b.revolut.com/api/1.0");
  });
});

describe("loadConfig", () => {
  it("reads required fields from env", () => {
    const cfg = loadConfig({
      REVOLUT_CLIENT_ID: "cid",
      REVOLUT_ISSUER: "example.com",
      REVOLUT_PRIVATE_KEY: "/tmp/key.pem",
      REVOLUT_REDIRECT_URI: "https://example.com/cb",
      REVOLUT_REFRESH_TOKEN: "rt",
    } as NodeJS.ProcessEnv);
    expect(cfg.clientId).toBe("cid");
    expect(cfg.issuer).toBe("example.com");
    expect(cfg.privateKeyPath).toBe("/tmp/key.pem");
    expect(cfg.refreshToken).toBe("rt");
  });

  it("throws listing every missing required field", () => {
    expect(() => loadConfig({} as NodeJS.ProcessEnv)).toThrowError(
      /clientId.*issuer.*privateKeyPath.*redirectUri/s,
    );
  });
});
