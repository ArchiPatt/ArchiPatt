import { SignJWT } from "jose";
import { env } from "../env";
import { getPrivateKey } from "./jwks";

export type AccessTokenClaims = {
  sub: string;
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
    roles: claims.roles,
    scope: claims.scope,
  })
    .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
    .setIssuer(env.issuer)
    .setAudience(claims.aud)
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + env.tokens.accessTtlSeconds)
    .sign(privateKey);
}
