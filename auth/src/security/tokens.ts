import { SignJWT } from "jose";
import { randomUUID } from "crypto";
import { env } from "../env";
import { getPrivateKey } from "./jwks";

export type AccessTokenClaims = {
  sub: string;
  username: string;
  roles: string[];
  scope: string;
  aud: string;
};

export async function issueAccessToken(
  claims: AccessTokenClaims,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await getPrivateKey();

  return await new SignJWT({
    username: claims.username,
    roles: claims.roles,
    scope: claims.scope,
  })
    .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
    .setIssuer(env.issuer)
    .setAudience(claims.aud)
    .setSubject(claims.sub)
    .setJti(randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + env.tokens.accessTtlSeconds)
    .sign(privateKey);
}
