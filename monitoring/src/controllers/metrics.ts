import * as events from "../services/events";
import type { MetricsSummary } from "../types/events";

export function parseWindowMinutes(query: Record<string, unknown>): number {
  const raw = query.windowMinutes;
  const w = raw !== undefined && raw !== null ? Number(raw) : 60;
  return Number.isFinite(w) && w > 0 && w <= 24 * 60 ? Math.floor(w) : 60;
}

export async function metricsSummaryController(
  windowMinutes: number,
): Promise<MetricsSummary> {
  return events.getSummary(windowMinutes);
}
