import { FastifyInstance } from "fastify";
import { createAccountsHandlers } from "../handlers/accounts";

export function registerAccountsRoutes(app: FastifyInstance) {
  const h = createAccountsHandlers(app);

  app.get<{ Querystring: { clientId?: string } }>("/accounts", h.list);
  app.get<{ Params: { id: string } }>("/accounts/:id", h.get);
  app.get<{
    Params: { id: string };
    Querystring: { limit?: string; offset?: string; sort?: string };
  }>("/accounts/:id/operations", h.getOperations);
  app.post<{ Body: { clientId?: string } }>("/accounts", h.create);
  app.post<{ Params: { id: string } }>("/accounts/:id/close", h.close);
  app.post<{
    Params: { id: string };
    Body: { amount?: unknown };
  }>("/accounts/:id/deposit", h.deposit);
  app.post<{
    Params: { id: string };
    Body: { amount?: unknown };
  }>("/accounts/:id/withdraw", h.withdraw);
  app.post<{
    Body: {
      fromAccountId?: string;
      toAccountId?: string;
      amount?: unknown;
      idempotencyKey?: string;
    };
  }>("/accounts/transfer", h.transfer);
  app.post<{
    Params: { id: string };
    Body: {
      amount?: unknown;
      idempotencyKey?: string;
      type?: string;
      correlationId?: string;
      meta?: Record<string, unknown>;
    };
  }>("/internal/accounts/:id/operations", h.internalPostOperation);

  app.post<{
    Body: {
      toAccountId?: string;
      amount?: unknown;
      idempotencyKey?: string;
      type?: string;
      meta?: Record<string, unknown>;
    };
  }>("/internal/transfers/from-master", h.internalTransferFromMaster);

  app.post<{
    Body: {
      fromAccountId?: string;
      amount?: unknown;
      idempotencyKey?: string;
      type?: string;
      meta?: Record<string, unknown>;
    };
  }>("/internal/transfers/to-master", h.internalTransferToMaster);
}
