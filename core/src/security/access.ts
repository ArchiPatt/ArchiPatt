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

/** WebSocket по счёту: сотрудники — как раньше; клиент — только с ролью `client`. */
export function canUseAccountOperationsWs(
  payload: JWTPayload | null,
  accountClientId: string,
): boolean {
  if (!canReadAccount(payload, accountClientId)) return false;
  if (canManageAll(payload)) return true;
  return hasRole(payload, "client");
}

/**
 * Агрегированный поток операций клиента по всем счетам (не для employee/admin).
 */
export function canUseClientOperationsStream(
  payload: JWTPayload | null,
): boolean {
  if (!payload?.sub) return false;
  if (canManageAll(payload)) return false;
  return hasRole(payload, "client");
}
