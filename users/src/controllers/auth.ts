import { JWTPayload } from "jose";
import { hasRole } from "../security/jwt";

export type RequireAuthFail = { ok: false; code: number };
export type RequireAuthOk = { ok: true; payload: JWTPayload };

export function requireAuth(
  payload: JWTPayload | null,
): RequireAuthFail | RequireAuthOk {
  if (!payload) return { ok: false, code: 401 };
  return { ok: true, payload };
}

export function canManage(payload: JWTPayload) {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}
