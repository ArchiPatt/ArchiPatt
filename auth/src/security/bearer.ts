import type { CryptoKey, KeyObject } from "jose";
import { importJWK, jwtVerify } from "jose";
import { env } from "../env";
import { getJwks } from "./jwks";

/** Совпадает с `aud` в `issueAccessToken` (см. `issueTokensForProfile`). */
const ACCESS_TOKEN_AUDIENCE = "bank-app";

let cachedVerificationKey: CryptoKey | KeyObject | null = null;

async function getLocalVerificationKey(): Promise<CryptoKey | KeyObject> {
  if (cachedVerificationKey) return cachedVerificationKey;
  const jwks = await getJwks();
  const jwk = jwks.keys[0];
  if (!jwk) throw new Error("JWKS пуст: нет ключа для проверки access token");
  cachedVerificationKey = await importJWK(jwk, "RS256");
  return cachedVerificationKey;
}

/** RFC 7235: схема в Authorization не чувствительна к регистру. */
function parseBearerToken(authorizationHeader?: string): string | null {
  const raw = authorizationHeader?.trim();
  if (!raw) return null;
  const m = /^Bearer\s+(.*)$/i.exec(raw);
  if (!m) return null;
  const token = m[1].trim();
  return token || null;
}

export async function verifyAccessToken(authorizationHeader?: string) {
  const token = parseBearerToken(authorizationHeader);
  if (!token) return null;

  const key = await getLocalVerificationKey();
  const { payload } = await jwtVerify(token, key, {
    issuer: env.issuer,
    audience: ACCESS_TOKEN_AUDIENCE,
  });
  return payload;
}
