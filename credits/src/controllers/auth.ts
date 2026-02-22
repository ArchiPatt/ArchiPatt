import { JWTPayload } from "jose";
import { hasRole } from "../security/jwt";

export function isEmployee(payload: JWTPayload): boolean {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

export function requireAuth(payload: JWTPayload | null) {
  if (!payload) {
    return { ok: false as const, code: 401 as const };
  }
  return { ok: true as const, payload };
}

