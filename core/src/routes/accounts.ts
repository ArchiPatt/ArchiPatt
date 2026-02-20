import { FastifyInstance } from "fastify";
import { Account } from "../db/entities/Account";
import { verifyBearerToken } from "../security/jwt";
import {
  canReadAccount,
  canManageAll,
  canCreateAccountFor,
  canCloseAccount,
} from "../security/access";

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

  app.post<{ Body: { clientId?: string } }>("/accounts", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    if (!payload.sub) return reply.code(403).send({ error: "forbidden" });

    const clientId = canManageAll(payload)
      ? (req.body?.clientId ?? payload.sub)
      : payload.sub;
    if (!canCreateAccountFor(payload, clientId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const repo = app.db.getRepository(Account);
    const account = await repo.save(
      repo.create({ clientId, balance: "0", status: "open" }),
    );
    return reply.code(201).send(account);
  });

  app.post<{ Params: { id: string } }>(
    "/accounts/:id/close",
    async (req, reply) => {
      const payload = await authPayloadOrNull(req);
      if (!payload) return reply.code(401).send({ error: "unauthorized" });

      const repo = app.db.getRepository(Account);
      const account = await repo.findOne({ where: { id: req.params.id } });
      if (!account) return reply.code(404).send({ error: "account_not_found" });
      if (!canCloseAccount(payload, account.clientId)) {
        return reply.code(403).send({ error: "forbidden" });
      }
      if (account.status === "closed") {
        return reply.code(400).send({ error: "account_already_closed" });
      }

      account.status = "closed";
      await repo.save(account);
      return account;
    },
  );
}
