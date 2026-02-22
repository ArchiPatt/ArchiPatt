import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyBearerToken } from "../security/jwt";
import { createTariffController, listTariffsController } from "../controllers/tariffs";

export function createTariffsHandlers(app: FastifyInstance) {
  return {
    list: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await listTariffsController(app.db, payload);
      return reply.code(res.status).send(res.body);
    },
    create: async (
      req: FastifyRequest<{ Body: { name?: string; interestRate?: number; billingPeriodDays?: number } }>,
      reply: FastifyReply
    ) => {
      const payload = await safeVerify(req);
      const res = await createTariffController(app.db, payload, req.body ?? {});
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

