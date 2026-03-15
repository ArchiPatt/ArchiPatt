import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { authPayloadOrNull } from '../controllers/auth';
import { getColorSchemeController, setColorSchemeController } from '../controllers/colorScheme';
import {
  getHiddenAccountsController,
  addHiddenAccountController,
  removeHiddenAccountController,
} from '../controllers/hiddenAccounts';

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

      const res = await setColorSchemeController(app.db, auth.payload, {
        colorScheme: req.body?.colorScheme,
      });
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

      const res = await addHiddenAccountController(app.db, auth.payload, {
        accountId: req.body?.accountId,
      });
      return reply.code(res.status).send(res.body);
    },

    // DELETE /admin-settings/hidden-accounts/:accountId
    removeHiddenAccount: async (
      req: FastifyRequest<{ Params: { accountId: string } }>,
      reply: FastifyReply,
    ) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });

      const res = await removeHiddenAccountController(app.db, auth.payload, {
        accountId: req.params.accountId,
      });
      return reply.code(res.status).send(res.body);
    },
  };
}
