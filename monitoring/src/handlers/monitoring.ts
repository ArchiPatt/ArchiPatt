import type { FastifyReply, FastifyRequest } from "fastify";
import { ingestController } from "../controllers/ingest";
import {
  metricsSummaryController,
  parseWindowMinutes,
} from "../controllers/metrics";
import { getDashboardHtml } from "../utils/dashboardHtml";

export function createMonitoringHandlers() {
  return {
    postIngest: async (req: FastifyRequest, reply: FastifyReply) => {
      const res = await ingestController(req.body);
      return reply.code(res.status).send(res.body);
    },

    getMetricsSummary: async (req: FastifyRequest, reply: FastifyReply) => {
      const wm = parseWindowMinutes(req.query as Record<string, unknown>);
      const data = await metricsSummaryController(wm);
      return reply.send(data);
    },

    getDashboard: async (_req: FastifyRequest, reply: FastifyReply) => {
      reply.type("text/html; charset=utf-8");
      return getDashboardHtml();
    },
  };
}
