import { FastifyInstance } from "fastify";
import { createCreditsHandlers } from "../handlers/credits";
import { createTariffsHandlers } from "../handlers/tariffs";

export function registerCreditsRoutes(app: FastifyInstance) {
  const tariffs = createTariffsHandlers(app);
  const credits = createCreditsHandlers(app);

  app.get("/tariffs", tariffs.list);
  app.post("/tariffs", tariffs.create);

  app.post("/credits/issue", credits.issue);
  app.post("/credits/:id/repay", credits.repay);
  app.post("/credits/accrue/run", credits.runAccrual);
  app.get("/credits/by-client/:clientId", credits.byClient);
  app.get("/credits/:id", credits.details);
  app.get("/credits/:id/payments", credits.payments);
}
