import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyBearerToken } from "../security/jwt";
import {
  creditDetailsController,
  creditPaymentsController,
  creditsByClientController,
  issueCreditController,
  repayCreditController,
  runAccrualController
} from "../controllers/credits";

export function createCreditsHandlers(app: FastifyInstance) {
  return {
    issue: async (
      req: FastifyRequest<{ Body: { clientId?: string; accountId?: string; tariffId?: string; amount?: number } }>,
      reply: FastifyReply
    ) => {
      const payload = await safeVerify(req);
      const res = await issueCreditController(app.db, payload, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    repay: async (
      req: FastifyRequest<{ Params: { id: string }; Body: { amount?: number } }>,
      reply: FastifyReply
    ) => {
      const payload = await safeVerify(req);
      const res = await repayCreditController(app.db, payload, req.params, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    byClient: async (req: FastifyRequest<{ Params: { clientId: string } }>, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await creditsByClientController(app.db, payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    details: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await creditDetailsController(app.db, payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    payments: async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await creditPaymentsController(app.db, payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    runAccrual: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await runAccrualController(app.db, payload);
      return reply.code(res.status).send(res.body);
    }
  };
}

async function safeVerify(req: FastifyRequest) {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}

