import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyBearerToken } from "../security/jwt";
import {
  blockController,
  createController,
  getController,
  internalByUsernameController,
  internalListController,
  listController,
  meController,
} from "../controllers/users";
import { env } from "../env";

export function createUsersHandlers(app: FastifyInstance) {
  return {
    internalByUsername: async (
      req: FastifyRequest<{ Params: { username: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk = req.headers["x-internal-token"] === env.internalToken;
      const authorization = req.headers.authorization as string | undefined;
      const res = await internalByUsernameController(
        app.db,
        internalOk,
        req.params,
        authorization,
      );
      return reply.code(res.status).send(res.body);
    },

    internalList: async (
      req: FastifyRequest<{ Querystring: { limit?: string; offset?: string } }>,
      reply: FastifyReply,
    ) => {
      const internalOk = req.headers["x-internal-token"] === env.internalToken;
      const authorization = req.headers.authorization as string | undefined;
      const limit = parseInt(req.query?.limit ?? "20", 10) || 20;
      const offset = parseInt(req.query?.offset ?? "0", 10) || 0;
      const res = await internalListController(app.db, internalOk, {
        limit,
        offset,
      }, authorization);
      return reply.code(res.status).send(res.body);
    },

    me: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await meController(app.db, payload);
      return reply.code(res.status).send(res.body);
    },

    list: async (req: FastifyRequest, reply: FastifyReply) => {
      const payload = await safeVerify(req);
      const res = await listController(app.db, payload);
      return reply.code(res.status).send(res.body);
    },

    get: async (
      req: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const res = await getController(app.db, payload, req.params);
      return reply.code(res.status).send(res.body);
    },

    create: async (
      req: FastifyRequest<{
        Body: { username?: string; displayName?: string; roles?: string[] };
      }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const res = await createController(app.db, payload, req.body ?? {});
      return reply.code(res.status).send(res.body);
    },

    block: async (
      req: FastifyRequest<{
        Params: { id: string };
        Body: { isBlocked?: boolean };
      }>,
      reply: FastifyReply,
    ) => {
      const payload = await safeVerify(req);
      const res = await blockController(
        app.db,
        payload,
        req.params,
        req.body ?? {},
      );
      return reply.code(res.status).send(res.body);
    },
  };
}

async function safeVerify(req: FastifyRequest) {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}
