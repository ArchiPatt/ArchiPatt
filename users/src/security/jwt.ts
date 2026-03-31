import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";
import { env } from "../env";
import { traceHeaders } from "../trace/traceContext";

const JWKS_URL = `${env.auth.issuer}/jwks`;
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function isRevoked(jti: string): Promise<boolean> {
  const url = `${env.authService.baseUrl}/internal/tokens/revoked/${encodeURIComponent(jti)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-internal-token": env.authService.internalToken,
      ...traceHeaders(),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.warn("[Users JWT] isRevoked failed:", res.status, text);
    throw new Error(`auth revoke check failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { revoked?: boolean };
  const revoked = Boolean(data.revoked);
  if (revoked) console.warn("[Users JWT] Токен отозван, jti:", jti);
  return revoked;
}

export async function verifyBearerToken(
  authorization?: string,
): Promise<JWTPayload | null> {
  const expectedIssuer = env.auth.issuer;

  if (!authorization?.startsWith("Bearer ")) {
    console.warn(
      "[Users JWT] Нет Bearer в Authorization:",
      authorization ? "заголовок есть, но не Bearer" : "заголовок отсутствует"
    );
    return null;
  }
  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return null;

  const decoded = decodeJwtPayload(token);
  if (decoded) {
    const tokenIss = decoded.iss as string | undefined;
    const issuerMatch = tokenIss === expectedIssuer;
    console.log(
      "[Users JWT] Токен: iss=",
      tokenIss,
      "| ожидаем issuer=",
      expectedIssuer,
      "| совпадает:",
      issuerMatch,
      "| JWKS:",
      JWKS_URL
    );
  }

  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer: expectedIssuer,
    });
    if (typeof payload.jti === "string" && (await isRevoked(payload.jti))) {
      return null;
    }
    return payload;
  } catch (e) {
    console.warn(
      "[Users JWT] jwtVerify failed:",
      String(e),
      "| issuer:",
      expectedIssuer,
      "| JWKS:",
      JWKS_URL
    );
    throw e;
  }
}

export function hasRole(payload: JWTPayload | null, role: string): boolean {
  const roles = payload?.roles;
  return Array.isArray(roles) && roles.includes(role);
}
