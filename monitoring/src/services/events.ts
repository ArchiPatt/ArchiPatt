import { Pool, type PoolClient } from "pg";
import { env } from "../env";
import type { IngestEvent, MetricsSummary, MinuteBucket } from "../types/events";

let pool: Pool | null = null;

function createPool(): Pool {
  return new Pool({
    host: env.db.host,
    port: env.db.port,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    max: 20,
  });
}

export async function initStore(): Promise<void> {
  if (pool) return;
  pool = createPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      trace_id TEXT NOT NULL,
      source TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      error BOOLEAN NOT NULL,
      at_ms BIGINT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_at ON events (at_ms);
  `);
}

function getPool(): Pool {
  if (!pool) throw new Error("initStore() must be called before using events storage");
  return pool;
}

async function pruneIfNeeded(client: PoolClient): Promise<void> {
  const countRes = await client.query<{ c: string }>(
    `SELECT COUNT(*)::text AS c FROM events`,
  );
  const c = Number(countRes.rows[0]?.c ?? 0);
  if (c <= env.maxStoredEvents) return;
  const excess = c - env.maxStoredEvents + 5000;
  await client.query(
    `DELETE FROM events WHERE id IN (
       SELECT id FROM events ORDER BY at_ms ASC LIMIT $1
     )`,
    [excess],
  );
}

export async function ingestOne(ev: IngestEvent): Promise<void> {
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO events (trace_id, source, method, path, status_code, duration_ms, error, at_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        ev.traceId,
        ev.source,
        ev.method,
        ev.path,
        ev.statusCode,
        ev.durationMs,
        ev.error,
        ev.at,
      ],
    );
    await pruneIfNeeded(client);
  } finally {
    client.release();
  }
}

export async function ingestBatch(items: IngestEvent[]): Promise<void> {
  if (items.length === 0) return;
  const p = getPool();
  const client = await p.connect();
  try {
    await client.query("BEGIN");
    const insertSql = `INSERT INTO events (trace_id, source, method, path, status_code, duration_ms, error, at_ms)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
    for (const ev of items) {
      await client.query(insertSql, [
        ev.traceId,
        ev.source,
        ev.method,
        ev.path,
        ev.statusCode,
        ev.durationMs,
        ev.error,
        ev.at,
      ]);
    }
    await client.query("COMMIT");
    await pruneIfNeeded(client);
  } catch (e) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

export async function getSummary(windowMinutes: number): Promise<MetricsSummary> {
  const p = getPool();
  const windowMs = windowMinutes * 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;

  const { rows } = await p.query<{
    trace_id: string;
    source: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    error: boolean;
    at_ms: string;
  }>(
    `SELECT trace_id, source, method, path, status_code, duration_ms, error, at_ms
     FROM events WHERE at_ms >= $1 ORDER BY at_ms ASC`,
    [cutoff],
  );

  const slice: IngestEvent[] = rows.map((r) => ({
    traceId: r.trace_id,
    source: r.source,
    method: r.method,
    path: r.path,
    statusCode: r.status_code,
    durationMs: r.duration_ms,
    error: r.error,
    at: Number(r.at_ms),
  }));

  const totalRequests = slice.length;
  const errorRequests = slice.filter((e) => e.error).length;
  const errorRatePercent =
    totalRequests === 0
      ? 0
      : Math.round((errorRequests / totalRequests) * 1000) / 10;
  const avgDurationMs =
    totalRequests === 0
      ? 0
      : Math.round(slice.reduce((s, e) => s + e.durationMs, 0) / totalRequests);

  const minuteMap = new Map<
    number,
    { count: number; errors: number; totalDurationMs: number }
  >();
  for (const e of slice) {
    const t = Math.floor(e.at / 60_000) * 60_000;
    const prev = minuteMap.get(t) ?? {
      count: 0,
      errors: 0,
      totalDurationMs: 0,
    };
    prev.count += 1;
    if (e.error) prev.errors += 1;
    prev.totalDurationMs += e.durationMs;
    minuteMap.set(t, prev);
  }

  const series: MinuteBucket[] = [...minuteMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, v]) => ({
      t,
      count: v.count,
      errors: v.errors,
      totalDurationMs: v.totalDurationMs,
    }));

  const recentResult = await p.query<{
    trace_id: string;
    source: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    error: boolean;
    at_ms: string;
  }>(
    `SELECT trace_id, source, method, path, status_code, duration_ms, error, at_ms
     FROM events WHERE at_ms >= $1 ORDER BY id DESC LIMIT 50`,
    [cutoff],
  );

  const recent = recentResult.rows.map((r) => ({
    traceId: r.trace_id,
    method: r.method,
    path: r.path,
    statusCode: r.status_code,
    durationMs: r.duration_ms,
    error: r.error,
    at: new Date(Number(r.at_ms)).toISOString(),
    source: r.source,
  }));

  return {
    windowMinutes,
    totalRequests,
    errorRequests,
    errorRatePercent,
    avgDurationMs,
    series,
    recent,
  };
}

export async function closeStore(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
