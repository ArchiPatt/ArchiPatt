import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env";
import { safeVerify, requireActiveAuth } from "../controllers/auth";
import {
  listTariffsController,
  getTariffController,
  createTariffController,
} from "../controllers/tariffs";
import {
  listCreditsController,
  getCreditController,
  getPaymentsController,
  getCreditsByClientController,
  issueCreditController,
  repayCreditController,
  accrueRunController,
  internalByClientsController,
} from "../controllers/credits";

export function createCreditsHandlers(app: FastifyInstance) {
  return {
    listTariffs: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await listTariffsController(app.db, a.payload);
      return reply.code(res.status).send(res.body);
    },

    getTariff: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await getTariffController(app.db, a.payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    createTariff: async (
      req: FastifyRequest<{
        Body: {
          name?: string;
          interestRate?: number;
          billingPeriodDays?: number;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await createTariffController(app.db, a.payload, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    listCredits: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await listCreditsController(app.db, a.payload);
      return reply.code(res.status).send(res.body);
    },

    getCredit: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await getCreditController(app.db, a.payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    getPayments: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await getPaymentsController(app.db, a.payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    getCreditsByClient: async (
      req: FastifyRequest<{ Params: { clientId: string } }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await getCreditsByClientController(
        app.db,
        a.payload,
        req.params,
      );
      return reply.code(res.status).send(res.body);
    },

    issueCredit: async (
      req: FastifyRequest<{
        Body: {
          clientId?: string;
          accountId?: string;
          tariffId?: string;
          amount?: number;
        };
      }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await issueCreditController(app.db, a.payload, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    repayCredit: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: { amount?: number };
      }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await repayCreditController(app.db, a.payload, {
        ...req.params,
        amount: req.body?.amount,
      });
      return reply.code(res.status).send(res.body);
    },

    accrueRun: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });
      const res = await accrueRunController(app.db, a.payload);
      return reply.code(res.status).send(res.body);
    },

    internalByClients: async (
      req: FastifyRequest<{ Querystring: { clientIds?: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk =
        req.headers["x-internal-token"] === env.internalToken;
      const res = await internalByClientsController(app.db, internalOk, {
        clientIds: req.query?.clientIds,
      });
      return reply.code(res.status).send(res.body);
    },
  };
}
