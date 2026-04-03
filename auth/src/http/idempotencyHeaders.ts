import type { FastifyRequest } from "fastify";

export function idempotencyKeyFromRequest(
  req: FastifyRequest,
): string | undefined {
  const h =
    req.headers["idempotency-key"] ??
    req.headers["Idempotency-Key"] ??
    req.headers["IDEMPOTENCY-KEY"];
  if (typeof h === "string" && h.trim()) return h.trim();
  if (Array.isArray(h) && h[0]?.trim()) return h[0].trim();
  return undefined;
}

/**
 * Заголовок Idempotency-Key или поле idempotency_key из form/json тела
 */
export function resolveIdempotencyKey(req: FastifyRequest): string | undefined {
  const fromHeader = idempotencyKeyFromRequest(req);
  if (fromHeader) return fromHeader;
  const b = req.body;
  if (b && typeof b === "object" && b !== null && "idempotency_key" in b) {
    const v = (b as { idempotency_key?: unknown }).idempotency_key;
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}
