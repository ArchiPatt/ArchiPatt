import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";
import { enterTraceContext } from "../trace/traceContext";
import { postMonitoringIngest } from "../http/monitoringIngest";

declare module "fastify" {
  interface FastifyRequest {
    monitorTraceId: string;
    monitorTraceStartMs: number;
  }
}

/**
 * Трассировка и метрики в monitoring: traceId, duration, ошибки 5xx
 */
export function registerServiceMonitoring(
  app: FastifyInstance,
  options: { monitoringServiceUrl: string; source: string },
): void {
  const base = options.monitoringServiceUrl.trim();
  const { source } = options;

  app.addHook("onRequest", async (req, reply) => {
    const incoming = req.headers["x-trace-id"] ?? req.headers["x-request-id"];
    const traceId =
      typeof incoming === "string" && incoming.length > 0
        ? incoming
        : randomUUID();
    req.monitorTraceId = traceId;
    req.monitorTraceStartMs = Date.now();
    enterTraceContext(traceId);
    reply.header("x-trace-id", traceId);
  });

  app.addHook("onResponse", async (req, reply) => {
    const path = (req.raw.url ?? "").split("?")[0] ?? "";
    if (
      path === "/health" ||
      path.startsWith("/swagger") ||
      path.startsWith("/swagger-static")
    ) {
      return;
    }
    if (!base) return;

    const durationMs = Date.now() - req.monitorTraceStartMs;
    const statusCode = reply.statusCode;
    const error = statusCode >= 500;

    const url = `${base.replace(/\/$/, "")}/internal/ingest`;
    const body = JSON.stringify({
      traceId: req.monitorTraceId,
      source,
      method: req.method,
      path,
      statusCode,
      durationMs,
      error,
      at: Date.now(),
    });
    void postMonitoringIngest(url, body);
  });
}
