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
    // Evaluate exp at the same epoch we signed at (the claims, not wall-clock time, are under test).
    const decoded = jwt.verify(token, publicKeyPem, {
      algorithms: ["RS256"],
      clockTimestamp: 1_000_000,
    }) as jwt.JwtPayload;
    expect(decoded.iss).toBe("example.com");
    expect(decoded.sub).toBe("client-123");
    expect(decoded.aud).toBe("https://revolut.com");
    expect(decoded.exp).toBe(1_000_000 + 300);
  });
});
