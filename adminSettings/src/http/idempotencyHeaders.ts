import type { FastifyRequest } from "fastify";

export function idempotencyKeyFromRequest(
  req: FastifyRequest,
): string | undefined {
  const raw = req.headers["idempotency-key"];
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}
