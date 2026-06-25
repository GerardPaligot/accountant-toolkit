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
