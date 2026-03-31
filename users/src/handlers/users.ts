import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { verifyBearerToken } from "../security/jwt";
import { idempotencyKeyFromRequest } from "../http/idempotencyHeaders";
import { replayOrRun } from "../services/idempotencyReplay";
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
      const res = await internalListController(
        app.db,
        internalOk,
        {
          limit,
          offset,
        },
        authorization,
      );
      return reply.code(res.status).send(res.body);
    },

    me: async (req: FastifyRequest, reply: FastifyReply) => {
      const auth = (req.headers.authorization ?? req.headers.Authorization) as
        | string
        | undefined;
      const hasAuth = !!auth;
      req.log.info(
        {
          hasAuth,
          url: req.url,
          authPrefix: auth?.slice(0, 25) ?? "—",
        },
        "[Users] GET /me",
      );
      const payload = await safeVerify(req);
      req.log.info(
        { payload: payload ? "ok" : "null", sub: payload?.sub },
        "[Users] verify result",
      );
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
      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(app.db, key, "POST /users", () =>
        createController(app.db, payload, req.body ?? {}),
      );
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
      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(
        app.db,
        key,
        `PATCH /users/${req.params.id}/block`,
        () => blockController(app.db, payload, req.params, req.body ?? {}),
      );
      return reply.code(res.status).send(res.body);
    },
  };
}

async function safeVerify(req: FastifyRequest) {
  try {
    const auth = req.headers.authorization ?? req.headers.Authorization;
    return await verifyBearerToken(auth as string | undefined);
  } catch (err) {
    req.log.warn(
      {
        err: String(err),
        hasAuth: !!(req.headers.authorization ?? req.headers.Authorization),
        url: req.url,
      },
      "[Users] token verify failed",
    );
    return null;
  }
}
