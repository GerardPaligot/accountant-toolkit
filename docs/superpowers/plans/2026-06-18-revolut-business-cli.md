# Revolut Business CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a thin, standalone, deterministic Node/TypeScript CLI over the official Revolut Business API that fetches expense/transaction/receipt/reference data and prints clean JSON to stdout.

**Architecture:** Three layers — (1) `src/generated/` produced by OpenAPI Generator (`typescript-fetch`) from `../json/business.json`, never hand-edited; (2) `src/auth/` hand-written JWT signing + token cache/refresh (the OAuth host is outside the spec); (3) `src/cli/` thin commander commands that inject a token into the generated client, auto-paginate, and serialize JSON. The CLI does no matching/interpretation — it only fetches and prints.

**Tech Stack:** Node 24 (ESM), TypeScript, commander, jsonwebtoken, OpenAPI Generator (`typescript-fetch`, via `@openapitools/openapi-generator-cli`, needs Java — present: JDK 21), vitest for tests.

## Global Constraints

- **Project root:** `/Users/gpaligot/Documents/workspace/revolut-openapi/cli/`. All paths below are relative to it unless absolute.
- **Spec input:** `../json/business.json` (Business API v1.0).
- **API base (prod):** `https://b2b.revolut.com/api/1.0` — **sandbox:** `https://sandbox-b2b.revolut.com/api/1.0`. Global `--sandbox` flag selects sandbox.
- **OAuth token endpoint:** `<base>/auth/token` (form-encoded; NOT in the OpenAPI spec — hand-rolled).
- **Scopes:** all endpoints used require `READ`.
- **Module system:** ESM (`"type": "module"` in package.json). TypeScript `module`/`moduleResolution` = `nodenext`.
- **Output contract:** machine-readable JSON to **stdout** by default; errors to **stderr** with **nonzero exit**; `--pretty` renders a human table instead of JSON.
- **Secrets:** never logged. Config/token files written with mode `0600`. Config dir: `~/.config/revolut-cli/`.
- **The CLI never matches/uploads/edits.** Read-only data passthrough only.
- **`src/generated/` is a build artifact** — committed for consumers but regenerated via `npm run gen`, never hand-edited.

---

## File Structure

```
cli/
  package.json
  tsconfig.json
  openapitools.json            # pin generator version
  vitest.config.ts
  .gitignore
  src/
    generated/                 # OpenAPI Generator output (typescript-fetch) — DO NOT edit
    auth/
      config.ts                # load/merge config (env + ~/.config/revolut-cli/config.json), host resolution
      jwt.ts                   # sign RS256 client-assertion JWT
      token.ts                 # token cache (0600) + refresh via /auth/token
    api/
      client.ts                # build generated Configuration w/ async token provider
      paginate.ts              # time-window auto-pagination helper
    cli/
      output.ts                # printJson / printTable / fail (stderr + exit)
      index.ts                 # commander entrypoint, global --sandbox/--pretty, registers subcommands
      expenses.ts              # expenses list/get
      transactions.ts          # transactions list/get
      receipts.ts              # receipts download
      reference.ts             # accounts / categories / tax-rates list
      auth.ts                  # auth setup / status
  test/
    auth/config.test.ts
    auth/jwt.test.ts
    auth/token.test.ts
    api/paginate.test.ts
    cli/output.test.ts
    integration/sandbox.test.ts   # guarded; skips without sandbox creds
```

---

### Task 1: Project scaffold + generate API client

**Files:**
- Create: `cli/package.json`, `cli/tsconfig.json`, `cli/openapitools.json`, `cli/vitest.config.ts`, `cli/.gitignore`
- Create (generated): `cli/src/generated/**`
- Test: `cli/test/generated.smoke.test.ts`

**Interfaces:**
- Produces: npm scripts `gen`, `build`, `test`; the generated module `src/generated` exporting `Configuration`, `ExpensesApi`, `TransactionsApi`, `AccountsApi`, `AccountingCategoriesApi`, `TaxRatesApi`.

- [ ] **Step 1: Create `cli/package.json`**

```json
{
  "name": "revolut-business-cli",
  "version": "0.1.0",
  "type": "module",
  "bin": { "revolut": "./dist/cli/index.js" },
  "scripts": {
    "gen": "openapi-generator-cli generate -i ../json/business.json -g typescript-fetch -o src/generated --additional-properties=supportsES6=true,typescriptThreePlus=true,withoutRuntimeChecks=true",
    "build": "tsc -p tsconfig.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev": "tsx src/cli/index.ts"
  },
  "dependencies": {
    "commander": "^12.1.0",
    "jsonwebtoken": "^9.0.2"
  },
  "devDependencies": {
    "@openapitools/openapi-generator-cli": "^2.15.3",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create `cli/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Create `cli/openapitools.json` (pin generator version)**

```json
{
  "$schema": "node_modules/@openapitools/openapi-generator-cli/config.schema.json",
  "spaces": 2,
  "generator-cli": { "version": "7.10.0" }
}
```

- [ ] **Step 4: Create `cli/vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 5: Create `cli/.gitignore`**

```
node_modules/
dist/
*.log
```

- [ ] **Step 6: Install deps**

Run: `cd cli && npm install`
Expected: completes; `node_modules/.bin/openapi-generator-cli` exists.

- [ ] **Step 7: Generate the client**

Run: `cd cli && npm run gen`
Expected: downloads generator `7.10.0` jar (needs Java — present), writes `src/generated/` containing `apis/`, `models/`, `runtime.ts`, `index.ts`. No error.

- [ ] **Step 8: Record the generated method names**

Run: `cd cli && grep -rEh "async (getExpenses|getExpense|getExpenseReceipt|getTransactions|getTransaction|getAccounts|getAccountingCategories|getTaxRates)\b" src/generated/apis`
Expected: prints the async method signatures. Note the exact request-parameter interface names (e.g. `GetExpensesRequest`) and that `transaction_type` maps to `transactionType`. Later tasks rely on these camelCase names; if the generator emitted different names, adapt the command code accordingly.

- [ ] **Step 9: Write smoke test `cli/test/generated.smoke.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { Configuration, ExpensesApi, TransactionsApi } from "../src/generated/index.js";

describe("generated client", () => {
  it("exposes the API classes we depend on", () => {
    const cfg = new Configuration({ basePath: "https://example.test" });
    expect(typeof ExpensesApi).toBe("function");
    expect(typeof TransactionsApi).toBe("function");
    const api = new ExpensesApi(cfg);
    expect(typeof (api as unknown as { getExpenses: unknown }).getExpenses).toBe("function");
  });
});
```

- [ ] **Step 10: Run the smoke test**

Run: `cd cli && npm test -- generated.smoke`
Expected: PASS.

- [ ] **Step 11: Commit**

```bash
cd cli && git add package.json tsconfig.json openapitools.json vitest.config.ts .gitignore src/generated test/generated.smoke.test.ts package-lock.json
git commit -m "chore(cli): scaffold project and generate Business API client"
```

---

### Task 2: Config loader

**Files:**
- Create: `cli/src/auth/config.ts`
- Test: `cli/test/auth/config.test.ts`

**Interfaces:**
- Produces:
  - `interface RevolutConfig { clientId: string; issuer: string; privateKeyPath: string; refreshToken?: string; redirectUri: string }`
  - `function configDir(): string` → `~/.config/revolut-cli`
  - `function loadConfig(env?: NodeJS.ProcessEnv): RevolutConfig` — merges env over file; throws a clear Error listing missing required fields.
  - `function apiBase(sandbox: boolean): string` — returns prod/sandbox base URL.
  - `function tokenCachePath(): string` → `<configDir>/token.json`
  - `function saveConfig(cfg: RevolutConfig): void` — writes `<configDir>/config.json` mode `0600`.

- [ ] **Step 1: Write the failing test `cli/test/auth/config.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { apiBase, loadConfig } from "../../src/auth/config.js";

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
    expect(() => loadConfig({} as NodeJS.ProcessEnv)).toThrowError(/clientId.*issuer.*privateKeyPath.*redirectUri/s);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && npm test -- auth/config`
Expected: FAIL — `Cannot find module '../../src/auth/config.js'`.

- [ ] **Step 3: Implement `cli/src/auth/config.ts`**

```typescript
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
  return join(homedir(), ".config", "revolut-cli");
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && npm test -- auth/config`
Expected: PASS (3 tests). Note: the "throws listing every missing required field" test asserts the message names the missing keys; the order in the regex matches `required` order.

- [ ] **Step 5: Commit**

```bash
cd cli && git add src/auth/config.ts test/auth/config.test.ts
git commit -m "feat(cli): add config loader with env/file merge and host resolution"
```

---

### Task 3: JWT client-assertion signer

**Files:**
- Create: `cli/src/auth/jwt.ts`
- Test: `cli/test/auth/jwt.test.ts`

**Interfaces:**
- Consumes: `RevolutConfig` from Task 2.
- Produces: `function signClientAssertion(args: { clientId: string; issuer: string; privateKeyPem: string; now?: number }): string` — returns an RS256 JWT with claims `iss=issuer`, `sub=clientId`, `aud="https://revolut.com"`, `exp=now+300`.

- [ ] **Step 1: Write the failing test `cli/test/auth/jwt.test.ts`**

```typescript
import { describe, it, expect, beforeAll } from "vitest";
import { generateKeyPairSync } from "node:crypto";
import jwt from "jsonwebtoken";
import { signClientAssertion } from "../../src/auth/jwt.js";

let privateKeyPem: string;
let publicKeyPem: string;

beforeAll(() => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  privateKeyPem = privateKey;
  publicKeyPem = publicKey;
});

describe("signClientAssertion", () => {
  it("produces an RS256 JWT with the Revolut claims", () => {
    const token = signClientAssertion({
      clientId: "client-123",
      issuer: "example.com",
      privateKeyPem,
      now: 1_000_000,
    });
    const decoded = jwt.verify(token, publicKeyPem, { algorithms: ["RS256"] }) as jwt.JwtPayload;
    expect(decoded.iss).toBe("example.com");
    expect(decoded.sub).toBe("client-123");
    expect(decoded.aud).toBe("https://revolut.com");
    expect(decoded.exp).toBe(1_000_000 + 300);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && npm test -- auth/jwt`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `cli/src/auth/jwt.ts`**

```typescript
import jwt from "jsonwebtoken";

const AUDIENCE = "https://revolut.com";
const TTL_SECONDS = 300;

export function signClientAssertion(args: {
  clientId: string;
  issuer: string;
  privateKeyPem: string;
  now?: number;
}): string {
  const iat = args.now ?? Math.floor(Date.now() / 1000);
  return jwt.sign(
    {
      iss: args.issuer,
      sub: args.clientId,
      aud: AUDIENCE,
      iat,
      exp: iat + TTL_SECONDS,
    },
    args.privateKeyPem,
    { algorithm: "RS256" },
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && npm test -- auth/jwt`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd cli && git add src/auth/jwt.ts test/auth/jwt.test.ts
git commit -m "feat(cli): sign RS256 client-assertion JWT for Revolut OAuth"
```

---

### Task 4: Token manager (cache + refresh)

**Files:**
- Create: `cli/src/auth/token.ts`
- Test: `cli/test/auth/token.test.ts`

**Interfaces:**
- Consumes: `signClientAssertion` (Task 3), `RevolutConfig`, `apiBase`, `tokenCachePath` (Task 2).
- Produces:
  - `interface CachedToken { accessToken: string; expiresAt: number }`
  - `async function getAccessToken(opts: { config: RevolutConfig; sandbox: boolean; readKey: (p: string) => string; readCache: () => CachedToken | null; writeCache: (t: CachedToken) => void; fetchImpl?: typeof fetch; now?: () => number }): Promise<string>`
  - `async function exchangeAuthCode(opts: { config: RevolutConfig; sandbox: boolean; code: string; readKey: (p: string) => string; fetchImpl?: typeof fetch }): Promise<{ refreshToken: string; accessToken: string; expiresIn: number }>`

  Note the injected `readKey`/`readCache`/`writeCache`/`fetchImpl`/`now` seams exist so the unit test runs without disk or network. The CLI layer (Task 11) wires the real `fs`/`fetch` implementations.

- [ ] **Step 1: Write the failing test `cli/test/auth/token.test.ts`**

```typescript
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

describe("getAccessToken", () => {
  it("reuses a cached token that is still valid", async () => {
    const fetchImpl = vi.fn();
    const cache: CachedToken = { accessToken: "cached", expiresAt: 10_000 };
    const token = await getAccessToken({
      config: cfg,
      sandbox: false,
      readKey,
      readCache: () => cache,
      writeCache: () => {},
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: () => 9_000_000, // ms; expiresAt is seconds * 1000 below — see impl note
    });
    expect(token).toBe("cached");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("refreshes when no valid cache and writes the new token", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(JSON.stringify({ access_token: "fresh", expires_in: 2400 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
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
      new Response(JSON.stringify({ access_token: "a", refresh_token: "r", expires_in: 2400 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && npm test -- auth/token`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `cli/src/auth/token.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && npm test -- auth/token`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
cd cli && git add src/auth/token.ts test/auth/token.test.ts
git commit -m "feat(cli): add token cache + refresh and auth-code exchange"
```

---

### Task 5: API client factory + pagination

**Files:**
- Create: `cli/src/api/client.ts`, `cli/src/api/paginate.ts`
- Test: `cli/test/api/paginate.test.ts`

**Interfaces:**
- Consumes: `Configuration` (generated), `getAccessToken` (Task 4), `loadConfig`/`apiBase`/`tokenCachePath` (Task 2).
- Produces:
  - `async function buildConfiguration(sandbox: boolean): Promise<Configuration>` (in `client.ts`) — generated `Configuration` with `basePath = apiBase(sandbox)` and an async `accessToken` provider that wires real `fs`/`fetch` into `getAccessToken`.
  - `async function paginateByWindow<T>(opts: { fetchPage: (to?: string) => Promise<T[]>; getCursor: (item: T) => string; pageSize: number; hardLimit?: number }): Promise<T[]>` (in `paginate.ts`) — repeatedly calls `fetchPage`, after a full page sets `to` to the oldest item's cursor minus 1ms, stops on a short/empty page or `hardLimit`.

- [ ] **Step 1: Write the failing test `cli/test/api/paginate.test.ts`**

```typescript
import { describe, it, expect, vi } from "vitest";
import { paginateByWindow } from "../../src/api/paginate.js";

interface Row { id: string; created_at: string }

describe("paginateByWindow", () => {
  it("stops on a short page and returns all items", async () => {
    const pages: Row[][] = [
      [
        { id: "a", created_at: "2026-01-10T00:00:00Z" },
        { id: "b", created_at: "2026-01-09T00:00:00Z" },
      ],
      [{ id: "c", created_at: "2026-01-08T00:00:00Z" }],
    ];
    const fetchPage = vi.fn(async () => pages.shift() ?? []);
    const all = await paginateByWindow<Row>({
      fetchPage,
      getCursor: (r) => r.created_at,
      pageSize: 2,
    });
    expect(all.map((r) => r.id)).toEqual(["a", "b", "c"]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("passes the oldest cursor of a full page as the next `to`", async () => {
    const pages: Row[][] = [
      [
        { id: "a", created_at: "2026-01-10T00:00:00.000Z" },
        { id: "b", created_at: "2026-01-09T00:00:00.000Z" },
      ],
      [],
    ];
    const seenTo: (string | undefined)[] = [];
    const fetchPage = vi.fn(async (to?: string) => {
      seenTo.push(to);
      return pages.shift() ?? [];
    });
    await paginateByWindow<Row>({ fetchPage, getCursor: (r) => r.created_at, pageSize: 2 });
    expect(seenTo[0]).toBeUndefined();
    expect(seenTo[1]).toBe("2026-01-08T23:59:59.999Z");
  });

  it("honors hardLimit", async () => {
    const fetchPage = vi.fn(async () => [
      { id: "x", created_at: "2026-01-10T00:00:00Z" },
      { id: "y", created_at: "2026-01-09T00:00:00Z" },
    ]);
    const all = await paginateByWindow<Row>({
      fetchPage,
      getCursor: (r) => r.created_at,
      pageSize: 2,
      hardLimit: 3,
    });
    expect(all.length).toBeLessThanOrEqual(4);
    expect(fetchPage.mock.calls.length).toBeLessThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && npm test -- api/paginate`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `cli/src/api/paginate.ts`**

```typescript
export async function paginateByWindow<T>(opts: {
  fetchPage: (to?: string) => Promise<T[]>;
  getCursor: (item: T) => string;
  pageSize: number;
  hardLimit?: number;
}): Promise<T[]> {
  const all: T[] = [];
  let to: string | undefined = undefined;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const page = await opts.fetchPage(to);
    all.push(...page);
    if (page.length < opts.pageSize) break;
    if (opts.hardLimit !== undefined && all.length >= opts.hardLimit) break;
    const oldest = page[page.length - 1];
    const t = new Date(opts.getCursor(oldest)).getTime() - 1;
    to = new Date(t).toISOString();
  }
  return all;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && npm test -- api/paginate`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement `cli/src/api/client.ts`**

```typescript
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
```

- [ ] **Step 6: Verify it compiles**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit`
Expected: no errors. (If the generated `Configuration` rejects an async `accessToken`, change the provider to match the generated `ConfigurationParameters['accessToken']` type recorded in Task 1 Step 8.)

- [ ] **Step 7: Commit**

```bash
cd cli && git add src/api/client.ts src/api/paginate.ts test/api/paginate.test.ts
git commit -m "feat(cli): add authed client factory and time-window pagination"
```

---

### Task 6: Output helpers + CLI entrypoint skeleton

**Files:**
- Create: `cli/src/cli/output.ts`, `cli/src/cli/index.ts`
- Test: `cli/test/cli/output.test.ts`

**Interfaces:**
- Produces:
  - `function printJson(data: unknown): void` — `process.stdout.write(JSON.stringify(data, null, 2) + "\n")`.
  - `function printTable(rows: Record<string, unknown>[]): void` — `console.table(rows)`.
  - `function emit(data: Record<string, unknown>[], opts: { pretty: boolean }, wrapKey: string): void` — pretty → table, else JSON wrapped as `{ [wrapKey]: data }`.
  - `function fail(err: unknown): never` — message to stderr, `process.exit(1)`.
  - `function globalOpts(cmd: Command): { sandbox: boolean; pretty: boolean }` — reads the root command's `--sandbox`/`--pretty`.
  - CLI program in `index.ts` registering subcommands from later tasks (`registerExpenses`, `registerTransactions`, `registerReceipts`, `registerReference`, `registerAuth`).

- [ ] **Step 1: Write the failing test `cli/test/cli/output.test.ts`**

```typescript
import { describe, it, expect, vi, afterEach } from "vitest";
import { emit, fail } from "../../src/cli/output.js";

afterEach(() => vi.restoreAllMocks());

describe("emit", () => {
  it("writes wrapped JSON to stdout when not pretty", () => {
    const spy = vi.spyOn(process.stdout, "write").mockReturnValue(true);
    emit([{ id: "1" }], { pretty: false }, "expenses");
    const written = spy.mock.calls[0][0] as string;
    expect(JSON.parse(written)).toEqual({ expenses: [{ id: "1" }] });
  });
});

describe("fail", () => {
  it("writes to stderr and exits nonzero", () => {
    const errSpy = vi.spyOn(process.stderr, "write").mockReturnValue(true);
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((): never => {
      throw new Error("exit");
    }) as never);
    expect(() => fail(new Error("boom"))).toThrowError("exit");
    expect(String(errSpy.mock.calls[0][0])).toContain("boom");
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd cli && npm test -- cli/output`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `cli/src/cli/output.ts`**

```typescript
import type { Command } from "commander";

export function printJson(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

export function printTable(rows: Record<string, unknown>[]): void {
  console.table(rows);
}

export function emit(data: Record<string, unknown>[], opts: { pretty: boolean }, wrapKey: string): void {
  if (opts.pretty) {
    printTable(data);
  } else {
    printJson({ [wrapKey]: data });
  }
}

export function fail(err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  process.stderr.write(`error: ${msg}\n`);
  process.exit(1);
}

export function globalOpts(cmd: Command): { sandbox: boolean; pretty: boolean } {
  const root = cmd.parent ?? cmd;
  const o = root.opts<{ sandbox?: boolean; pretty?: boolean }>();
  return { sandbox: Boolean(o.sandbox), pretty: Boolean(o.pretty) };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd cli && npm test -- cli/output`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement `cli/src/cli/index.ts` (skeleton)**

```typescript
#!/usr/bin/env node
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
```

- [ ] **Step 6: Create stub registrars so the entrypoint compiles**

Create `cli/src/cli/expenses.ts`, `transactions.ts`, `receipts.ts`, `reference.ts`, `auth.ts`, each with a no-op registrar to be filled by later tasks:

```typescript
// cli/src/cli/expenses.ts  (repeat the pattern, renaming, for the other four files)
import type { Command } from "commander";
export function registerExpenses(_program: Command): void {}
```

For the other four files use the matching names: `registerTransactions`, `registerReceipts`, `registerReference`, `registerAuth`.

- [ ] **Step 7: Verify the CLI runs**

Run: `cd cli && npx tsx src/cli/index.ts --help`
Expected: prints usage with global `--sandbox`/`--pretty`; exit 0.

- [ ] **Step 8: Commit**

```bash
cd cli && git add src/cli/output.ts src/cli/index.ts src/cli/expenses.ts src/cli/transactions.ts src/cli/receipts.ts src/cli/reference.ts src/cli/auth.ts test/cli/output.test.ts
git commit -m "feat(cli): add output helpers and commander entrypoint skeleton"
```

---

### Task 7: Expenses commands (`list`, `get`)

**Files:**
- Modify: `cli/src/cli/expenses.ts`

**Interfaces:**
- Consumes: `buildConfiguration` (Task 5), `paginateByWindow` (Task 5), `emit`/`printJson`/`fail`/`globalOpts` (Task 6), generated `ExpensesApi` + `GetExpensesRequest` (names from Task 1 Step 8).
- Produces: `revolut expenses list` and `revolut expenses get <id>` subcommands.

- [ ] **Step 1: Implement `cli/src/cli/expenses.ts`**

```typescript
import type { Command } from "commander";
import { ExpensesApi } from "../generated/index.js";
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
    .option("--account <id>", "account id filter")
    .action(async (opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new ExpensesApi(await buildConfiguration(g.sandbox));
        const rows = await paginateByWindow<Record<string, unknown>>({
          pageSize: PAGE,
          getCursor: (e) => String(e.expense_date ?? e.completed_at ?? e.submitted_at),
          fetchPage: async (to) =>
            (await api.getExpenses({
              from: opts.from,
              to: to ?? opts.to,
              count: PAGE,
              state: opts.state,
              transactionType: opts.type,
              account: opts.account,
            })) as unknown as Record<string, unknown>[],
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
        const expense = await api.getExpense({ expenseId: id });
        printJson(expense);
      } catch (err) {
        fail(err);
      }
    });
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit`
Expected: no errors. If generated method/param names differ from `getExpenses({from,to,count,state,transactionType,account})` or `getExpense({expenseId})`, align to the names recorded in Task 1 Step 8.

- [ ] **Step 3: Verify the command is wired**

Run: `cd cli && npx tsx src/cli/index.ts expenses --help`
Expected: lists `list` and `get` subcommands.

- [ ] **Step 4: Commit**

```bash
cd cli && git add src/cli/expenses.ts
git commit -m "feat(cli): add expenses list and get commands"
```

---

### Task 8: Transactions commands (`list`, `get`)

**Files:**
- Modify: `cli/src/cli/transactions.ts`

**Interfaces:**
- Consumes: same as Task 7; generated `TransactionsApi` with `getTransactions`/`getTransaction` (names from Task 1 Step 8).
- Produces: `revolut transactions list` and `revolut transactions get <id>`.

- [ ] **Step 1: Implement `cli/src/cli/transactions.ts`**

```typescript
import type { Command } from "commander";
import { TransactionsApi } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { paginateByWindow } from "../api/paginate.js";
import { emit, printJson, fail, globalOpts } from "./output.js";

const PAGE = 100;

export function registerTransactions(program: Command): void {
  const tx = program.command("transactions").description("Revolut transactions (read-only)");

  tx
    .command("list")
    .description("List transactions, auto-paginating the full window")
    .requiredOption("--from <iso>", "from date-time (inclusive)")
    .requiredOption("--to <iso>", "to date-time (exclusive)")
    .option("--type <type>", "transaction type filter")
    .option("--account <id>", "account id filter")
    .action(async (opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new TransactionsApi(await buildConfiguration(g.sandbox));
        const rows = await paginateByWindow<Record<string, unknown>>({
          pageSize: PAGE,
          getCursor: (t) => String(t.created_at ?? t.completed_at),
          fetchPage: async (to) =>
            (await api.getTransactions({
              from: opts.from,
              to: to ?? opts.to,
              count: PAGE,
              type: opts.type,
              account: opts.account,
            })) as unknown as Record<string, unknown>[],
        });
        emit(rows, g, "transactions");
      } catch (err) {
        fail(err);
      }
    });

  tx
    .command("get <id>")
    .description("Retrieve a single transaction")
    .action(async (id, _opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new TransactionsApi(await buildConfiguration(g.sandbox));
        const transaction = await api.getTransaction({ id });
        printJson(transaction);
      } catch (err) {
        fail(err);
      }
    });
}
```

- [ ] **Step 2: Verify it compiles and is wired**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit && npx tsx src/cli/index.ts transactions --help`
Expected: no type errors; lists `list` and `get`. Align names to Task 1 Step 8 if needed.

- [ ] **Step 3: Commit**

```bash
cd cli && git add src/cli/transactions.ts
git commit -m "feat(cli): add transactions list and get commands"
```

---

### Task 9: Receipts download command

**Files:**
- Modify: `cli/src/cli/receipts.ts`

**Interfaces:**
- Consumes: `buildConfiguration` (Task 5), `fail`/`globalOpts` (Task 6), generated `ExpensesApi` with `getExpense` and `getExpenseReceiptRaw` (raw variant exposes the fetch `Response` for binary + content-type; confirm the raw method name in Task 1 Step 8).
- Produces: `revolut receipts download <expenseId> [--receipt <id>] --out <dir>` — downloads every `receipt_id` of the expense (or just the one given) to `<dir>/<expenseId>_<receiptId>.<ext>`, where `<ext>` is derived from the response `content-type`.

- [ ] **Step 1: Implement `cli/src/cli/receipts.ts`**

```typescript
import type { Command } from "commander";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ExpensesApi } from "../generated/index.js";
import { buildConfiguration } from "../api/client.js";
import { fail, globalOpts, printJson } from "./output.js";

const EXT_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};

function extFor(contentType: string | null): string {
  if (!contentType) return "bin";
  const base = contentType.split(";")[0].trim().toLowerCase();
  return EXT_BY_TYPE[base] ?? "bin";
}

export function registerReceipts(program: Command): void {
  program
    .command("receipts")
    .description("Download receipts attached to an expense")
    .command("download <expenseId>")
    .requiredOption("--out <dir>", "output directory")
    .option("--receipt <id>", "download only this receipt id")
    .action(async (expenseId, opts, cmd) => {
      const g = globalOpts(cmd);
      try {
        const api = new ExpensesApi(await buildConfiguration(g.sandbox));
        const expense = (await api.getExpense({ expenseId })) as unknown as { receipt_ids?: string[] };
        const ids = opts.receipt ? [opts.receipt] : expense.receipt_ids ?? [];
        if (ids.length === 0) {
          printJson({ downloaded: [], note: "expense has no receipts" });
          return;
        }
        mkdirSync(opts.out, { recursive: true });
        const downloaded: string[] = [];
        for (const receiptId of ids) {
          const raw = await api.getExpenseReceiptRaw({ expenseId, receiptId });
          const res = raw.raw; // underlying fetch Response
          const buf = Buffer.from(await res.arrayBuffer());
          const ext = extFor(res.headers.get("content-type"));
          const path = join(opts.out, `${expenseId}_${receiptId}.${ext}`);
          writeFileSync(path, buf);
          downloaded.push(path);
        }
        printJson({ downloaded });
      } catch (err) {
        fail(err);
      }
    });
}
```

- [ ] **Step 2: Verify it compiles and is wired**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit && npx tsx src/cli/index.ts receipts download --help`
Expected: no type errors; usage shows `<expenseId>`, `--out`, `--receipt`. If `getExpenseReceiptRaw` / `.raw` differ, align to the generated runtime (`ApiResponse<T>` exposes `.raw`).

- [ ] **Step 3: Commit**

```bash
cd cli && git add src/cli/receipts.ts
git commit -m "feat(cli): add receipts download command"
```

---

### Task 10: Reference commands (`accounts`, `categories`, `tax-rates`)

**Files:**
- Modify: `cli/src/cli/reference.ts`

**Interfaces:**
- Consumes: `buildConfiguration` (Task 5), `emit`/`fail`/`globalOpts` (Task 6), generated `AccountsApi`/`AccountingCategoriesApi`/`TaxRatesApi` (names from Task 1 Step 8).
- Produces: `revolut accounts list`, `revolut categories list`, `revolut tax-rates list`.

- [ ] **Step 1: Implement `cli/src/cli/reference.ts`**

```typescript
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
        const rows = (await api.getAccounts()) as unknown as Record<string, unknown>[];
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
        const res = (await api.getAccountingCategories({})) as unknown as Record<string, unknown>;
        emit((res.categories ?? res) as Record<string, unknown>[], g, "categories");
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
        const res = (await api.getTaxRates({})) as unknown as Record<string, unknown>;
        emit((res.tax_rates ?? res) as Record<string, unknown>[], g, "tax_rates");
      } catch (err) {
        fail(err);
      }
    });
}
```

- [ ] **Step 2: Verify it compiles and is wired**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit && npx tsx src/cli/index.ts categories list --help`
Expected: no type errors; command exists. The `accounting-categories`/`tax-rates` list responses are paginated objects — confirm the wrapper key (`categories`/`tax_rates`) against the generated model from Task 1 Step 8 and adjust the `res.categories ?? res` fallback.

- [ ] **Step 3: Commit**

```bash
cd cli && git add src/cli/reference.ts
git commit -m "feat(cli): add accounts, categories, and tax-rates list commands"
```

---

### Task 11: Auth commands (`setup`, `status`) + bin build

**Files:**
- Modify: `cli/src/cli/auth.ts`

**Interfaces:**
- Consumes: `loadConfig`/`saveConfig`/`apiBase`/`tokenCachePath`/`configDir` (Task 2), `exchangeAuthCode` (Task 4), `fail`/`printJson` (Task 6).
- Produces: `revolut auth setup` (interactive one-time consent → store refresh token) and `revolut auth status` (report token validity without printing secrets).

- [ ] **Step 1: Implement `cli/src/cli/auth.ts`**

```typescript
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
        process.stderr.write(`Open this URL, authorize, then paste the \`code\` from the redirect:\n${authorizeUrl(cfg)}\n`);
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
    .action(async () => {
      try {
        const cfg = loadConfig();
        const p = tokenCachePath();
        let token: CachedToken | null = null;
        if (existsSync(p)) token = JSON.parse(readFileSync(p, "utf8")) as CachedToken;
        printJson({
          clientId: cfg.clientId,
          base: apiBase(false),
          hasRefreshToken: Boolean(cfg.refreshToken),
          accessTokenValid: token ? token.expiresAt > Date.now() : false,
          expiresAt: token ? new Date(token.expiresAt).toISOString() : null,
        });
      } catch (err) {
        fail(err);
      }
    });
}
```

- [ ] **Step 2: Verify it compiles and is wired**

Run: `cd cli && npx tsc -p tsconfig.json --noEmit && npx tsx src/cli/index.ts auth --help`
Expected: no type errors; lists `setup` and `status`.

- [ ] **Step 3: Build the distributable bin**

Run: `cd cli && npm run build && node dist/cli/index.js --help`
Expected: compiles to `dist/`; `--help` prints usage. (The `authorizeUrl` host is a best-effort default; confirm the exact consent URL against Revolut's "make your first API request" guide — open item §10 of the spec.)

- [ ] **Step 4: Commit**

```bash
cd cli && git add src/cli/auth.ts
git commit -m "feat(cli): add auth setup and status commands"
```

---

### Task 12: Sandbox integration test (guarded) + README

**Files:**
- Create: `cli/test/integration/sandbox.test.ts`, `cli/README.md`

**Interfaces:**
- Consumes: the built CLI + sandbox credentials supplied via env.
- Produces: an integration test that is **skipped** unless `REVOLUT_SANDBOX_IT=1` and sandbox creds are present.

- [ ] **Step 1: Write `cli/test/integration/sandbox.test.ts`**

```typescript
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

const run = process.env.REVOLUT_SANDBOX_IT === "1";

describe.skipIf(!run)("sandbox integration", () => {
  it("lists expenses as JSON", () => {
    const out = execFileSync(
      "npx",
      ["tsx", "src/cli/index.ts", "--sandbox", "expenses", "list", "--from", "2020-01-01", "--to", "2030-01-01"],
      { encoding: "utf8" },
    );
    const parsed = JSON.parse(out) as { expenses: unknown[] };
    expect(Array.isArray(parsed.expenses)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test (skipped by default)**

Run: `cd cli && npm test -- integration/sandbox`
Expected: test is **skipped** (no `REVOLUT_SANDBOX_IT`). With real sandbox creds + `REVOLUT_SANDBOX_IT=1`, it lists expenses.

- [ ] **Step 3: Write `cli/README.md`**

```markdown
# revolut-business-cli

Read-only CLI over the official Revolut Business API. Fetches expenses,
transactions, receipts, and reference data; prints clean JSON to stdout.
Does no matching, uploading, or editing — the public API has no write path
for receipts/expenses.

## Setup

1. Enroll an API certificate in Revolut Business → Settings → APIs and note
   the `client_id`, your JWT `issuer`, the private key path, and a
   `redirect_uri`.
2. Provide config via env (`REVOLUT_CLIENT_ID`, `REVOLUT_ISSUER`,
   `REVOLUT_PRIVATE_KEY`, `REVOLUT_REDIRECT_URI`) or `~/.config/revolut-cli/config.json`.
3. `npm install && npm run gen && npm run build`
4. `revolut auth setup` (one-time consent → stores the refresh token).

## Commands

- `revolut expenses list --state missing_info --from <iso> --to <iso>`
- `revolut expenses get <id>`
- `revolut receipts download <expenseId> --out ./dir [--receipt <id>]`
- `revolut transactions list --from <iso> --to <iso>`
- `revolut transactions get <id>`
- `revolut accounts list` / `categories list` / `tax-rates list`
- `--sandbox` global flag targets the sandbox; `--pretty` renders a table.

## Regenerating the client

`npm run gen` re-runs OpenAPI Generator against `../json/business.json`.
Never hand-edit `src/generated/`.
```

- [ ] **Step 4: Run the full suite + build**

Run: `cd cli && npm test && npm run build`
Expected: all unit tests pass (integration skipped); build succeeds.

- [ ] **Step 5: Commit**

```bash
cd cli && git add test/integration/sandbox.test.ts README.md
git commit -m "test(cli): add guarded sandbox integration test and README"
```

---

## Self-Review

**Spec coverage:**
- §2 read-only constraint → no write commands anywhere (Tasks 7–11 are all GET). ✓
- §3 API surface → expenses (T7), transactions (T8), receipts (T9), accounts/categories/tax-rates (T10). ✓
- §4 auth (Bearer, 40-min token, hand-rolled `/auth/token`, client-assertion JWT, one-time consent) → config (T2), jwt (T3), token+exchange (T4), client provider (T5), auth setup/status (T11). ✓
- §5 three-layer architecture → `generated/` (T1), `auth/` (T2–T4), `api/`+`cli/` (T5–T11). ✓
- §6 commands + JSON-default/`--pretty`/`--sandbox` → output (T6), all command tasks. ✓
- §7 generation one-liner → npm `gen` script (T1). ✓
- §8 error handling (stderr + nonzero) → `fail()` (T6), used in every command. ✓
- §9 testing (auth unit, sandbox integration, output snapshot shape) → T2–T6 unit, T12 integration. ✓
- §10 open items (auth host, receipt media types, packaging) → flagged inline at T11 Step 3 (consent URL), T9 (content-type→ext), T1/T11 (bin packaging). ✓

**Placeholder scan:** No TBD/TODO; every code step has complete code. The only deferred verifications are generated-name confirmations, which point to a concrete source (Task 1 Step 8) — not placeholders.

**Type consistency:** `RevolutConfig`, `CachedToken`, `getAccessToken`, `exchangeAuthCode`, `buildConfiguration`, `paginateByWindow`, `emit`/`fail`/`globalOpts`, `register*` names are used identically across tasks. Generated method names (`getExpenses`, `getExpense`, `getExpenseReceiptRaw`, `getTransactions`, `getTransaction`, `getAccounts`, `getAccountingCategories`, `getTaxRates`) are all anchored to Task 1 Step 8 for verification.

**Known risk:** exact generated request-param/method names depend on the generator run; every command task includes a compile gate and a pointer to Task 1 Step 8 to reconcile. This is the only place reality can diverge from the plan.
