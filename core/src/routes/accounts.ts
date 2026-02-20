import { FastifyInstance } from "fastify";
import { Account } from "../db/entities/Account";
import { verifyBearerToken } from "../security/jwt";
import { canReadAccount, canManageAll } from "../security/access";

async function authPayloadOrNull(req: { headers: { authorization?: string } }) {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}

export function registerAccountsRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { clientId?: string };
  }>("/accounts", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });

    const repo = app.db.getRepository(Account);
    const clientId = req.query.clientId;

    if (canManageAll(payload)) {
      const where = clientId ? { clientId } : {};
      return repo.find({
        where,
        order: { createdAt: "DESC" },
      });
    }

    if (!payload.sub) return reply.code(403).send({ error: "forbidden" });
    return repo.find({
      where: { clientId: payload.sub },
      order: { createdAt: "DESC" },
    });
  });

  app.get<{ Params: { id: string } }>("/accounts/:id", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });

    const repo = app.db.getRepository(Account);
    const account = await repo.findOne({ where: { id: req.params.id } });
    if (!account) return reply.code(404).send({ error: "account_not_found" });

    if (!canReadAccount(payload, account.clientId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    return account;
  });
}
