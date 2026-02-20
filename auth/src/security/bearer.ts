import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env";

const jwks = createRemoteJWKSet(new URL(`${env.issuer}/jwks`));

export async function verifyAccessToken(authorizationHeader?: string) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const { payload } = await jwtVerify(token, jwks, {
    issuer: env.issuer,
  });
  return payload;
}
