import { JWTPayload } from "jose";
import { hasRole } from "../security/jwt";

export function requireAuth(payload: JWTPayload | null) {
  if (!payload) return { ok: false, code: 401 };
  return { ok: true, payload };
}

export function canManage(payload: JWTPayload) {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}
