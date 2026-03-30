import { randomUUID } from "node:crypto";
import type { FastifyInstance } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    bffTraceId: string;
    bffTraceStartMs: number;
  }
}

export function registerBffMonitoring(
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
    req.bffTraceId = traceId;
    req.bffTraceStartMs = Date.now();
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

    const durationMs = Date.now() - req.bffTraceStartMs;
    const statusCode = reply.statusCode;
    const error = statusCode >= 500;

    const url = `${base.replace(/\/$/, "")}/internal/ingest`;
    const body = JSON.stringify({
      traceId: req.bffTraceId,
      source,
      method: req.method,
      path,
      statusCode,
      durationMs,
      error,
      at: Date.now(),
    });
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2000);
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: ac.signal,
    })
      .catch(() => undefined)
      .finally(() => clearTimeout(t));
  });
}
