import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authPayloadOrNull } from "../controllers/auth";
import { clientsOverviewController } from "../controllers/dashboard";

export function createDashboardHandlers(app: FastifyInstance) {
  return {
    clientsOverview: async (
      req: FastifyRequest<{
        Querystring: { limit?: string; offset?: string };
      }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const limit = parseInt(req.query?.limit ?? "20", 10) || 20;
      const offset = parseInt(req.query?.offset ?? "0", 10) || 0;
      const authorization = req.headers.authorization as string | undefined;
      const res = await clientsOverviewController(app.db, auth.payload, {
        limit,
        offset,
      }, authorization);
      return reply.code(res.status).send(res.body);
    },
  };
}
