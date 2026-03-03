import { FastifyInstance } from "fastify";
import { createDashboardHandlers } from "../handlers/dashboard";

export function registerDashboardRoutes(app: FastifyInstance) {
  const h = createDashboardHandlers(app);

  app.get<{
    Querystring: { limit?: string; offset?: string };
  }>("/dashboard/clients-overview", h.clientsOverview);
}
