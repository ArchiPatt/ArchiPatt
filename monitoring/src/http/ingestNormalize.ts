import type { IngestEvent } from "../types/events";

export function isIngestBody(x: unknown): x is { events?: unknown } | IngestEvent {
  return typeof x === "object" && x !== null;
}

export function normalizeEvent(raw: unknown, fallbackAt: number): IngestEvent | null {
  if (typeof raw !== "object" || raw === null) return null;
  const o = raw as Record<string, unknown>;
  const traceId = typeof o.traceId === "string" ? o.traceId : "";
  const source =
    typeof o.source === "string" && o.source.length > 0 ? o.source : "unknown";
  const clientKind =
    o.kind === "rum" ||
    o.kind === "client" ||
    /^web-/i.test(source) ||
    /^mobile-/i.test(source);
  const methodRaw = typeof o.method === "string" ? o.method : "";
  const method =
    methodRaw.length > 0 ? methodRaw : clientKind ? "CLIENT" : "";
  const pathFromRoute = typeof o.route === "string" ? o.route : "";
  const pathField = typeof o.path === "string" ? o.path : "";
  const path = pathField.length > 0 ? pathField : pathFromRoute;
  const statusCode =
    typeof o.statusCode === "number" && Number.isFinite(o.statusCode)
      ? o.statusCode
      : 0;
  const durationMs =
    typeof o.durationMs === "number" && Number.isFinite(o.durationMs)
      ? o.durationMs
      : 0;
  const error = o.error === true;
  const at =
    typeof o.at === "number" && Number.isFinite(o.at) ? o.at : fallbackAt;
  if (!traceId || !method) return null;
  return {
    traceId,
    source,
    method,
    path: path.length > 0 ? path : clientKind ? "/" : "",
    statusCode,
    durationMs,
    error,
    at,
  };
}

export type ParsedIngest =
  | { kind: "invalid_body" }
  | { kind: "invalid_event" }
  | { kind: "batch"; events: IngestEvent[] }
  | { kind: "single"; event: IngestEvent };

export function parseIngestPayload(body: unknown): ParsedIngest {
  const now = Date.now();
  if (!isIngestBody(body)) {
    return { kind: "invalid_body" };
  }
  const maybeEvents = (body as { events?: unknown }).events;
  if (Array.isArray(maybeEvents)) {
    const list: IngestEvent[] = [];
    for (const item of maybeEvents) {
      const ev = normalizeEvent(item, now);
      if (ev) list.push(ev);
    }
    return { kind: "batch", events: list };
  }
  const one = normalizeEvent(body, now);
  if (!one) {
    return { kind: "invalid_event" };
  }
  return { kind: "single", event: one };
}
