import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { env } from "../env";

const jwks = createRemoteJWKSet(new URL(`${env.authIssuer}/jwks`));

export async function verifyBearerToken(
  authorization?: string,
): Promise<JWTPayload | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const { payload } = await jwtVerify(token, jwks, {
    issuer: env.authIssuer,
  });
  return payload;
}

export function hasRole(payload: JWTPayload | null, role: string): boolean {
  const roles = payload?.roles;
  return Array.isArray(roles) && roles.includes(role);
}
