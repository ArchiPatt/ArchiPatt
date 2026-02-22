import { JWTPayload } from "jose";
import { hasRole } from "../security/jwt";

export function requireAuth(payload: JWTPayload | null) {
  if (!payload) return { ok: false as const, code: 401 as const };
  return { ok: true as const, payload };
}

export function canManage(payload: JWTPayload) {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

