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

export type MinuteBucket = {
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
