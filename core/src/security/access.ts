import { JWTPayload } from "jose";
import { hasRole } from "./jwt";

export function canManageAll(payload: JWTPayload | null): boolean {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

export function canReadAccount(
  payload: JWTPayload | null,
  clientId: string,
): boolean {
  if (!payload?.sub) return false;
  return payload.sub === clientId || canManageAll(payload);
}

export function canCreateAccountFor(
  payload: JWTPayload | null,
  clientId: string,
): boolean {
  if (!payload?.sub) return false;
  return payload.sub === clientId || canManageAll(payload);
}

export function canCloseAccount(
  payload: JWTPayload | null,
  clientId: string,
): boolean {
  return canReadAccount(payload, clientId);
}
