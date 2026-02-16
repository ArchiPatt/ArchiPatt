import { SignJWT } from "jose";
import { env } from "../env";
import { getPrivateKey } from "./jwks";

export type AccessTokenClaims = {
  sub: string;
  roles: string[];
  scope: string;
  aud: string;
};

export async function issueAccessToken(claims: AccessTokenClaims): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await getPrivateKey();

  return await new SignJWT({
    roles: claims.roles,
    scope: claims.scope
  })
    .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
    .setIssuer(env.issuer)
    .setAudience(claims.aud)
    .setSubject(claims.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + env.tokens.accessTtlSeconds)
    .sign(privateKey);
}

export async function issueIdToken(params: {
  sub: string;
  aud: string;
  nonce?: string | null;
  authTime?: number;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privateKey = await getPrivateKey();

  const payload: Record<string, unknown> = {};
  if (params.nonce) payload.nonce = params.nonce;
  if (params.authTime) payload.auth_time = params.authTime;

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid: "auth-default", typ: "JWT" })
    .setIssuer(env.issuer)
    .setAudience(params.aud)
    .setSubject(params.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + env.tokens.idTtlSeconds)
    .sign(privateKey);
}

