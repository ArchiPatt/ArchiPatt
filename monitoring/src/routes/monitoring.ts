import type { FastifyInstance } from "fastify";
import { createMonitoringHandlers } from "../handlers/monitoring";

export function registerMonitoringRoutes(app: FastifyInstance) {
  const h = createMonitoringHandlers();

  app.get("/health", async () => ({ ok: true }));

  app.post("/internal/ingest", h.postIngest);
  app.post("/public/ingest", h.postIngest);

  app.get("/api/metrics/summary", h.getMetricsSummary);

  app.get("/", h.getDashboard);
}
