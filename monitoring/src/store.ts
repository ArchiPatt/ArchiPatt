import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "./env";

export type IngestEvent = {
  traceId: string;
  source: string;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  error: boolean;
  at: number;
};

type MinuteBucket = {
  t: number;
  count: number;
  errors: number;
  totalDurationMs: number;
};

export type MetricsSummary = {
  windowMinutes: number;
  totalRequests: number;
  errorRequests: number;
  errorRatePercent: number;
  avgDurationMs: number;
  series: MinuteBucket[];
  recent: Array<{
    traceId: string;
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    error: boolean;
    at: string;
    source: string;
  }>;
};

let dbInstance: Database.Database | null = null;
let insertPrepared: ReturnType<Database.Database["prepare"]> | null = null;

function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  const dir = path.dirname(env.sqlitePath);
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(env.sqlitePath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trace_id TEXT NOT NULL,
      source TEXT NOT NULL,
      method TEXT NOT NULL,
      path TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      duration_ms INTEGER NOT NULL,
      error INTEGER NOT NULL,
      at_ms INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_events_at ON events(at_ms);
  `);
  insertPrepared = db.prepare(
    `INSERT INTO events (trace_id, source, method, path, status_code, duration_ms, error, at_ms)
     VALUES (@traceId, @source, @method, @path, @statusCode, @durationMs, @error, @at)`,
  );
  dbInstance = db;
  return db;
}

function getInsert(): ReturnType<Database.Database["prepare"]> {
  getDb();
  return insertPrepared!;
}

function pruneIfNeeded(): void {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as c FROM events`).get() as {
    c: number;
  };
  if (row.c <= env.maxStoredEvents) return;
  const excess = row.c - env.maxStoredEvents + 5000;
  db.prepare(
    `DELETE FROM events WHERE id IN (SELECT id FROM events ORDER BY at_ms ASC LIMIT ?)`,
  ).run(excess);
}

export function ingestOne(ev: IngestEvent): void {
  getInsert().run({
    traceId: ev.traceId,
    source: ev.source,
    method: ev.method,
    path: ev.path,
    statusCode: ev.statusCode,
    durationMs: ev.durationMs,
    error: ev.error ? 1 : 0,
    at: ev.at,
  });
  pruneIfNeeded();
}

export function ingestBatch(items: IngestEvent[]): void {
  if (items.length === 0) return;
  const db = getDb();
  const ins = getInsert();
  const tx = db.transaction((rows: IngestEvent[]) => {
    for (const ev of rows) {
      ins.run({
        traceId: ev.traceId,
        source: ev.source,
        method: ev.method,
        path: ev.path,
        statusCode: ev.statusCode,
        durationMs: ev.durationMs,
        error: ev.error ? 1 : 0,
        at: ev.at,
      });
    }
  });
  tx(items);
  pruneIfNeeded();
}

export function getSummary(windowMinutes: number): MetricsSummary {
  const db = getDb();
  const windowMs = windowMinutes * 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;

  const rows = db
    .prepare(
      `SELECT trace_id, source, method, path, status_code, duration_ms, error, at_ms
       FROM events WHERE at_ms >= ? ORDER BY at_ms ASC`,
    )
    .all(cutoff) as Array<{
    trace_id: string;
    source: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    error: number;
    at_ms: number;
  }>;

  const slice: IngestEvent[] = rows.map((r) => ({
    traceId: r.trace_id,
    source: r.source,
    method: r.method,
    path: r.path,
    statusCode: r.status_code,
    durationMs: r.duration_ms,
    error: r.error === 1,
    at: r.at_ms,
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

  const recentRows = db
    .prepare(
      `SELECT trace_id, source, method, path, status_code, duration_ms, error, at_ms
       FROM events WHERE at_ms >= ? ORDER BY id DESC LIMIT 50`,
    )
    .all(cutoff) as Array<{
    trace_id: string;
    source: string;
    method: string;
    path: string;
    status_code: number;
    duration_ms: number;
    error: number;
    at_ms: number;
  }>;

  const recent = recentRows.map((r) => ({
    traceId: r.trace_id,
    method: r.method,
    path: r.path,
    statusCode: r.status_code,
    durationMs: r.duration_ms,
    error: r.error === 1,
    at: new Date(r.at_ms).toISOString(),
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

/** Тесты / graceful shutdown */
export function closeStore(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    insertPrepared = null;
  }
}
