import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { env } from "../env";
import { CIRCUIT_AUTH_SERVICE, resilientFetch } from "../http/resilientFetch";
import { traceHeaders } from "../trace/traceContext";

const jwks = createRemoteJWKSet(new URL(`${env.authIssuer}/jwks`));

async function isRevoked(jti: string): Promise<boolean> {
  const url = `${env.authService.baseUrl}/internal/tokens/revoked/${encodeURIComponent(jti)}`;
  const res = await resilientFetch(CIRCUIT_AUTH_SERVICE, url, {
    method: "GET",
    headers: {
      "x-internal-token": env.authService.internalToken,
      ...traceHeaders(),
    },
  });
  if (!res.ok) throw new Error("authHooks revoke check failed");
  const data = (await res.json()) as { revoked?: boolean };
  return Boolean(data.revoked);
}

export async function verifyBearerToken(
  authorization?: string,
): Promise<JWTPayload | null> {
  if (!authorization?.startsWith("Bearer ")) return null;
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const { payload } = await jwtVerify(token, jwks, {
    issuer: env.authIssuer,
  });
  if (typeof payload.jti === "string" && (await isRevoked(payload.jti))) {
    return null;
  }
  return payload;
}

export function hasRole(payload: JWTPayload | null, role: string): boolean {
  const roles = payload?.roles;
  return Array.isArray(roles) && roles.includes(role);
}
