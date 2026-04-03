import { DataSource, QueryFailedError } from "typeorm";
import { IdempotencyLedger } from "../db/entities/IdempotencyLedger";

function isPgUniqueViolation(e: unknown): boolean {
  if (!(e instanceof QueryFailedError)) return false;
  const d = (e as QueryFailedError & { driverError?: { code?: string } })
    .driverError;
  return d?.code === "23505";
}

/**
 * Повтор того же Idempotency-Key возвращает сохранённый ответ (статус + тело).
 * Ответы 5xx не фиксируем – клиент может безопасно повторить запрос.
 */
export async function replayOrRun(
  ds: DataSource,
  key: string | undefined,
  scope: string,
  run: () => Promise<{ status?: number; body?: unknown }>,
): Promise<{ status: number; body: unknown }> {
  if (!key?.trim()) {
    return { status: 400, body: { error: "idempotency_key_required" } };
  }
  const k = key.trim();
  const repo = ds.getRepository(IdempotencyLedger);
  const existing = await repo.findOne({ where: { key: k } });
  if (existing) {
    if (existing.scope !== scope) {
      return { status: 409, body: { error: "idempotency_scope_mismatch" } };
    }
    return { status: existing.statusCode, body: existing.body };
  }

  const raw = await run();
  const status =
    typeof raw.status === "number" && Number.isFinite(raw.status)
      ? raw.status
      : 500;
  const body = raw.body ?? { error: "empty_response" };
  const persist = status >= 200 && status < 500;
  if (persist) {
    try {
      await repo.insert({
        key: k,
        scope,
        statusCode: status,
        body: body as object,
      });
    } catch (e) {
      if (!isPgUniqueViolation(e)) throw e;
      const row = await repo.findOne({ where: { key: k } });
      if (row) {
        if (row.scope !== scope) {
          return { status: 409, body: { error: "idempotency_scope_mismatch" } };
        }
        return { status: row.statusCode, body: row.body };
      }
      throw e;
    }
  }
  return { status, body };
}
