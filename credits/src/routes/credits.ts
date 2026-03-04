import { FastifyInstance } from "fastify";
import { createCreditsHandlers } from "../handlers/credits";

export function registerCreditsRoutes(app: FastifyInstance) {
  const h = createCreditsHandlers(app);

  app.get("/tariffs", h.listTariffs);
  app.get<{ Params: { id: string } }>("/tariffs/:id", h.getTariff);
  app.post<{
    Body: {
      name?: string;
      interestRate?: number;
      billingPeriodDays?: number;
    };
  }>("/tariffs", h.createTariff);

  app.get("/credits", h.listCredits);
  app.post<{
    Body: {
      clientId?: string;
      accountId?: string;
      tariffId?: string;
      amount?: number;
    };
  }>("/credits/issue", h.issueCredit);
  app.post<{ Params: { id: string }; Body: { amount?: number } }>(
    "/credits/:id/repay",
    h.repayCredit,
  );
  app.post("/credits/accrue/run", h.accrueRun);

  app.get<{ Querystring: { clientIds?: string } }>(
    "/internal/credits/by-clients",
    h.internalByClients,
  );

  app.get<{ Params: { clientId: string } }>(
    "/credits/by-client/:clientId",
    h.getCreditsByClient,
  );

  app.get<{ Querystring: { clientId?: string } }>(
    "/credits/overdue",
    h.getOverdueCredits,
  );

  app.get<{ Params: { clientId: string } }>(
    "/credits/rating/:clientId",
    h.getCreditRating,
  );

  app.get<{ Params: { id: string } }>("/credits/:id", h.getCredit);
  app.get<{ Params: { id: string } }>("/credits/:id/payments", h.getPayments);
}
