import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { authPayloadOrNull } from "../controllers/auth";
import { idempotencyKeyFromRequest } from "../http/idempotencyHeaders";
import { replayOrRun } from "../services/idempotencyReplay";
import {
  getColorSchemeController,
  setColorSchemeController,
} from "../controllers/colorScheme";
import {
  getHiddenAccountsController,
  addHiddenAccountController,
  removeHiddenAccountController,
} from "../controllers/hiddenAccounts";

export function createSettingsHandlers(app: FastifyInstance) {
  return {
    // GET /admin-settings/color-scheme
    getColorScheme: async (_req: FastifyRequest, reply: FastifyReply) => {
      const auth = await authPayloadOrNull(_req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const res = await getColorSchemeController(app.db, auth.payload);
      return reply.code(res.status).send(res.body);
    },

    // POST /admin-settings/color-scheme
    setColorScheme: async (
      req: FastifyRequest<{ Body: { colorScheme?: unknown } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(
        app.db,
        key,
        "POST /client-settings/color-scheme",
        () =>
          setColorSchemeController(app.db, auth.payload, {
            colorScheme: req.body?.colorScheme,
          }),
      );
      return reply.code(res.status).send(res.body);
    },

    // GET /admin-settings/hidden-accounts
    getHiddenAccounts: async (_req: FastifyRequest, reply: FastifyReply) => {
      const auth = await authPayloadOrNull(_req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const res = await getHiddenAccountsController(app.db, auth.payload);
      return reply.code(res.status).send(res.body);
    },

    // POST /admin-settings/hidden-accounts
    addHiddenAccount: async (
      req: FastifyRequest<{ Body: { accountId?: unknown } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(
        app.db,
        key,
        "POST /client-settings/hidden-accounts",
        () =>
          addHiddenAccountController(app.db, auth.payload, {
            accountId: req.body?.accountId,
          }),
      );
      return reply.code(res.status).send(res.body);
    },

    // DELETE /client-settings/hidden-accounts/:accountId
    removeHiddenAccount: async (
      req: FastifyRequest<{ Params: { accountId: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const key = idempotencyKeyFromRequest(req);
      const res = await replayOrRun(
        app.db,
        key,
        `DELETE /client-settings/hidden-accounts/${req.params.accountId}`,
        () =>
          removeHiddenAccountController(app.db, auth.payload, {
            accountId: req.params.accountId,
          }),
      );
      return reply.code(res.status).send(res.body);
    },
  };
}
