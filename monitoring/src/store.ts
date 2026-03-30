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

const MAX_EVENTS = 25_000;
const events: IngestEvent[] = [];

export function ingestOne(ev: IngestEvent): void {
  events.push(ev);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
}

export function ingestBatch(items: IngestEvent[]): void {
  for (const ev of items) ingestOne(ev);
}

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

export function getSummary(windowMinutes: number): MetricsSummary {
  const windowMs = windowMinutes * 60_000;
  const now = Date.now();
  const cutoff = now - windowMs;
  const slice = events.filter((e) => e.at >= cutoff);

  const totalRequests = slice.length;
  const errorRequests = slice.filter((e) => e.error).length;
  const errorRatePercent =
    totalRequests === 0 ? 0 : Math.round((errorRequests / totalRequests) * 1000) / 10;
  const avgDurationMs =
    totalRequests === 0
      ? 0
      : Math.round(
          slice.reduce((s, e) => s + e.durationMs, 0) / totalRequests,
        );

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

  const recentRaw = slice.slice(-50).reverse();
  const recent = recentRaw.map((e) => ({
    traceId: e.traceId,
    method: e.method,
    path: e.path,
    statusCode: e.statusCode,
    durationMs: e.durationMs,
    error: e.error,
    at: new Date(e.at).toISOString(),
    source: e.source,
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
