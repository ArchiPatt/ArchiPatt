import { FastifyInstance } from "fastify";
import { JWTPayload } from "jose";
import { Account } from "../db/entities/Account";
import { AccountOperation } from "../db/entities/AccountOperation";
import { AccountStatus } from "../db/enums/AccountStatus";
import { verifyBearerToken } from "../security/jwt";
import { fetchUserProfileByUsername } from "../integrations/users-service";
import {
  canReadAccount,
  canManageAll,
  canCreateAccountFor,
  canCloseAccount,
} from "../security/access";
import { env } from "../env";

async function authPayloadOrNull(req: { headers: { authorization?: string } }) {
  try {
    const payload = await verifyBearerToken(req.headers.authorization);
    const username =
      typeof payload?.username === "string" ? payload.username : null;
    if (!payload?.sub || !username) {
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    }

    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    if (profile.isBlocked)
      return { ok: false as const, code: 403 as const, error: "blocked_user" };

    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, code: 401 as const, error: "unauthorized" };
  }
}

export function registerAccountsRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { clientId?: string };
  }>("/accounts", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;

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
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;

    const repo = app.db.getRepository(Account);
    const account = await repo.findOne({ where: { id: req.params.id } });
    if (!account) return reply.code(404).send({ error: "account_not_found" });

    if (!canReadAccount(payload, account.clientId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    return account;
  });

  app.get<{
    Params: { id: string };
    Querystring: { limit?: string; offset?: string; sort?: string };
  }>("/accounts/:id/operations", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;

    const account = await app.db
      .getRepository(Account)
      .findOne({ where: { id: req.params.id } });
    if (!account) return reply.code(404).send({ error: "account_not_found" });
    if (!canReadAccount(payload, account.clientId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const limit = Math.min(
      Math.max(1, parseInt(req.query.limit ?? "20", 10) || 20),
      100,
    );
    const offset = Math.max(0, parseInt(req.query.offset ?? "0", 10) || 0);
    const sort = req.query.sort === "asc" ? "ASC" : "DESC";

    const [items, total] = await app.db
      .getRepository(AccountOperation)
      .findAndCount({
        where: { accountId: req.params.id },
        order: { createdAt: sort },
        take: limit,
        skip: offset,
      });

    return { items, total };
  });

  app.post<{ Body: { clientId?: string } }>("/accounts", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;
    if (!payload.sub) return reply.code(403).send({ error: "forbidden" });

    const clientId = canManageAll(payload)
      ? (req.body?.clientId ?? payload.sub)
      : payload.sub;
    if (!canCreateAccountFor(payload, clientId)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    const repo = app.db.getRepository(Account);
    const account = await repo.save(
      repo.create({ clientId, balance: "0", status: AccountStatus.Open }),
    );
    return reply.code(201).send(account);
  });

  app.post<{ Params: { id: string } }>(
    "/accounts/:id/close",
    async (req, reply) => {
      const auth = await authPayloadOrNull(req);
      if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
      const payload: JWTPayload = auth.payload;

      const repo = app.db.getRepository(Account);
      const account = await repo.findOne({ where: { id: req.params.id } });
      if (!account) return reply.code(404).send({ error: "account_not_found" });
      if (!canCloseAccount(payload, account.clientId)) {
        return reply.code(403).send({ error: "forbidden" });
      }
      if (account.status === AccountStatus.Closed) {
        return reply.code(400).send({ error: "account_already_closed" });
      }

      account.status = AccountStatus.Closed;
      await repo.save(account);
      return account;
    },
  );

  const parseAmount = (v: unknown): number | null => {
    const n =
      typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  app.post<{
    Params: { id: string };
    Body: { amount?: unknown };
  }>("/accounts/:id/deposit", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;

    const amount = parseAmount(req.body?.amount);
    if (amount == null)
      return reply.code(400).send({ error: "invalid_amount" });

    const result = await app.db.manager.transaction(async (em) => {
      const account = await em.findOne(Account, {
        where: { id: req.params.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!account) return null;
      if (!canReadAccount(payload, account.clientId)) return "forbidden";
      if (account.status === AccountStatus.Closed) return "closed";

      const prev = parseFloat(account.balance);
      const next = (prev + amount).toFixed(2);
      account.balance = next;
      await em.save(account);
      await em.save(
        em.create(AccountOperation, {
          accountId: account.id,
          amount: amount.toFixed(2),
          type: "deposit",
        }),
      );
      return account;
    });

    if (result === null)
      return reply.code(404).send({ error: "account_not_found" });
    if (result === "forbidden")
      return reply.code(403).send({ error: "forbidden" });
    if (result === "closed")
      return reply.code(400).send({ error: "account_closed" });
    return result;
  });

  app.post<{
    Params: { id: string };
    Body: { amount?: unknown };
  }>("/accounts/:id/withdraw", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    const payload: JWTPayload = auth.payload;

    const amount = parseAmount(req.body?.amount);
    if (amount == null)
      return reply.code(400).send({ error: "invalid_amount" });

    const result = await app.db.manager.transaction(async (em) => {
      const account = await em.findOne(Account, {
        where: { id: req.params.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!account) return null;
      if (!canReadAccount(payload, account.clientId)) return "forbidden";
      if (account.status === AccountStatus.Closed) return "closed";

      const prev = parseFloat(account.balance);
      if (prev < amount) return "insufficient_balance";

      const next = (prev - amount).toFixed(2);
      account.balance = next;
      await em.save(account);
      await em.save(
        em.create(AccountOperation, {
          accountId: account.id,
          amount: (-amount).toFixed(2),
          type: "withdraw",
        }),
      );
      return account;
    });

    if (result === null)
      return reply.code(404).send({ error: "account_not_found" });
    if (result === "forbidden")
      return reply.code(403).send({ error: "forbidden" });
    if (result === "closed")
      return reply.code(400).send({ error: "account_closed" });
    if (result === "insufficient_balance")
      return reply.code(400).send({ error: "insufficient_balance" });
    return result;
  });

  app.post<{
    Params: { id: string };
    Body: {
      amount?: unknown;
      idempotencyKey?: string;
      type?: string;
      correlationId?: string;
      meta?: Record<string, unknown>;
    };
  }>("/internal/accounts/:id/operations", async (req, reply) => {
    const token = req.headers["x-internal-token"];
    if (token !== env.internalToken) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const idempotencyKey = req.body?.idempotencyKey?.trim();
    if (!idempotencyKey) {
      return reply.code(400).send({ error: "idempotency_key_required" });
    }

    const n =
      typeof req.body?.amount === "string"
        ? parseFloat(req.body.amount)
        : typeof req.body?.amount === "number"
          ? req.body.amount
          : NaN;
    if (!Number.isFinite(n) || n === 0) {
      return reply.code(400).send({ error: "invalid_amount" });
    }

    const opRepo = app.db.getRepository(AccountOperation);
    const existing = await opRepo.findOne({
      where: { accountId: req.params.id, idempotencyKey },
    });
    if (existing) return existing;

    const result = await app.db.manager.transaction(async (em) => {
      const dup = await em.findOne(AccountOperation, {
        where: { accountId: req.params.id, idempotencyKey },
      });
      if (dup) return { op: dup, created: false };

      const account = await em.findOne(Account, {
        where: { id: req.params.id },
        lock: { mode: "pessimistic_write" },
      });
      if (!account) return null;
      if (account.status === AccountStatus.Closed) return "closed";

      const prev = parseFloat(account.balance);
      const next = (prev + n).toFixed(2);
      if (parseFloat(next) < 0) return "insufficient_balance";

      account.balance = next;
      await em.save(account);
      const op = await em.save(
        em.create(AccountOperation, {
          accountId: account.id,
          amount: n.toFixed(2),
          type: req.body?.type ?? null,
          correlationId: req.body?.correlationId ?? null,
          idempotencyKey,
          meta: req.body?.meta ?? null,
        }),
      );
      return { op, created: true };
    });

    if (result === null)
      return reply.code(404).send({ error: "account_not_found" });
    if (result === "closed")
      return reply.code(400).send({ error: "account_closed" });
    if (result === "insufficient_balance")
      return reply.code(400).send({ error: "insufficient_balance" });
    return result.created
      ? reply.code(201).send(result.op)
      : reply.send(result.op);
  });
}
