import { FastifyInstance, FastifyRequest } from "fastify";
import { JWTPayload } from "jose";
import { DataSource, In } from "typeorm";
import { Credit } from "../db/entities/Credit";
import { CreditPayment } from "../db/entities/CreditPayment";
import { CreditTariff } from "../db/entities/CreditTariff";
import { postAccountOperation } from "../integrations/core-service";
import { fetchUserProfileByUsername } from "../integrations/users-service";
import { verifyBearerToken } from "../security/jwt";
import { env } from "../env";

function toMoneyString(v: number): string {
  return v.toFixed(2);
}

function nowPlusDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function hasRole(payload: JWTPayload | null, role: string): boolean {
  const roles = payload?.roles;
  return Array.isArray(roles) && roles.includes(role);
}

function isEmployee(payload: JWTPayload): boolean {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

function requireAuth(payload: JWTPayload | null) {
  if (!payload) return { ok: false as const, code: 401 as const };
  return { ok: true as const, payload };
}

async function requireActiveAuth(payload: JWTPayload | null) {
  const a = requireAuth(payload);
  if (!a.ok)
    return { ok: false as const, code: a.code, error: "unauthorized" as const };
  const username =
    typeof a.payload.username === "string" ? a.payload.username : null;
  if (!a.payload.sub || !username) {
    return {
      ok: false as const,
      code: 401 as const,
      error: "unauthorized" as const,
    };
  }

  try {
    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return {
        ok: false as const,
        code: 401 as const,
        error: "unauthorized" as const,
      };
    if (profile.isBlocked)
      return {
        ok: false as const,
        code: 403 as const,
        error: "blocked_user" as const,
      };
  } catch {
    return {
      ok: false as const,
      code: 401 as const,
      error: "unauthorized" as const,
    };
  }

  return { ok: true as const, payload: a.payload };
}

async function safeVerify(req: FastifyRequest) {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}

export async function accrueDueCredits(ds: DataSource, now: Date = new Date()) {
  const creditsRepo = ds.getRepository(Credit);
  const dueCredits = await creditsRepo.find({
    where: { status: "active" as const },
    order: { nextPaymentDueAt: "ASC" },
  });

  const effectiveDueCredits = dueCredits.filter(
    (c) => c.nextPaymentDueAt.getTime() <= now.getTime(),
  );
  if (!effectiveDueCredits.length) {
    return { processedCredits: 0, accrualsCreated: 0, accruedTotal: "0.00" };
  }

  const tariffIds = [...new Set(effectiveDueCredits.map((c) => c.tariffId))];
  const tariffs = await ds
    .getRepository(CreditTariff)
    .find({ where: { id: In(tariffIds), isActive: true } });
  const tariffsById = new Map(tariffs.map((t) => [t.id, t]));

  let processedCredits = 0;
  let accrualsCreated = 0;
  let accruedTotal = 0;

  await ds.transaction(async (tx) => {
    const txCredits = tx.getRepository(Credit);
    const txPayments = tx.getRepository(CreditPayment);

    for (const credit of effectiveDueCredits) {
      const tariff = tariffsById.get(credit.tariffId);
      if (!tariff) continue;

      const rate = Number(tariff.interestRate);
      if (!Number.isFinite(rate) || rate < 0) continue;

      const periodDays =
        tariff.billingPeriodDays > 0 ? tariff.billingPeriodDays : 1;
      const maxCycles = 366;
      let cycles = 0;
      let outstanding = Number(credit.outstandingAmount);
      let dueAt = new Date(credit.nextPaymentDueAt);

      while (dueAt.getTime() <= now.getTime() && cycles < maxCycles) {
        cycles += 1;
        const interestAmount = Number((outstanding * rate).toFixed(2));
        if (interestAmount > 0) {
          outstanding += interestAmount;
          accruedTotal += interestAmount;
          accrualsCreated += 1;
          await txPayments.save(
            txPayments.create({
              creditId: credit.id,
              amount: toMoneyString(interestAmount),
              paymentType: "accrual",
              performedBy: "system:accrual-worker",
              performedAt: new Date(),
            }),
          );
        }
        dueAt = addDays(dueAt, periodDays);
      }

      if (cycles > 0) {
        credit.outstandingAmount = toMoneyString(outstanding);
        credit.nextPaymentDueAt = dueAt;
        await txCredits.save(credit);
        processedCredits += 1;
      }
    }
  });

  return {
    processedCredits,
    accrualsCreated,
    accruedTotal: toMoneyString(accruedTotal),
  };
}

export function registerCreditsRoutes(app: FastifyInstance) {
  app.get("/tariffs", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });

    const tariffs = await app.db.getRepository(CreditTariff).find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
    return reply.code(200).send(tariffs);
  });

  app.get<{ Params: { id: string } }>("/tariffs/:id", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });

    const tariff = await app.db
      .getRepository(CreditTariff)
      .findOne({ where: { id: req.params.id } });
    if (!tariff) return reply.code(404).send({ error: "tariff_not_found" });
    return reply.code(200).send(tariff);
  });

  app.post<{
    Body: { name?: string; interestRate?: number; billingPeriodDays?: number };
  }>("/tariffs", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });
    if (!isEmployee(a.payload))
      return reply.code(403).send({ error: "forbidden" });

    const name = req.body?.name?.trim();
    const interestRate = req.body?.interestRate;
    const billingPeriodDays = req.body?.billingPeriodDays ?? 1;

    if (!name || typeof interestRate !== "number" || interestRate < 0) {
      return reply.code(400).send({ error: "invalid_input" });
    }
    if (!Number.isInteger(billingPeriodDays) || billingPeriodDays <= 0) {
      return reply.code(400).send({ error: "invalid_billing_period" });
    }

    const repo = app.db.getRepository(CreditTariff);
    const exists = await repo.findOne({ where: { name } });
    if (exists) return reply.code(409).send({ error: "tariff_exists" });

    const tariff = await repo.save(
      repo.create({
        name,
        interestRate: interestRate.toFixed(4),
        billingPeriodDays,
        isActive: true,
      }),
    );
    return reply.code(201).send(tariff);
  });

  app.get("/credits", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });
    if (!isEmployee(a.payload)) return reply.code(403).send({ error: "forbidden" });

    const credits = await app.db.getRepository(Credit).find({
      order: { issuedAt: "DESC" }
    });
    return reply.code(200).send(credits);
  });

  app.post<{ Body: { clientId?: string; accountId?: string; tariffId?: string; amount?: number } }>("/credits/issue", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });

    const clientId = req.body?.clientId;
    const accountId = req.body?.accountId;
    const tariffId = req.body?.tariffId;
    const amount = req.body?.amount;

    if (
      !clientId ||
      !accountId ||
      !tariffId ||
      typeof amount !== "number" ||
      amount <= 0
    ) {
      return reply.code(400).send({ error: "invalid_input" });
    }

    const isOwner = String(a.payload.sub ?? "") === clientId;
    const allowed = isEmployee(a.payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    const tariff = await app.db
      .getRepository(CreditTariff)
      .findOne({ where: { id: tariffId, isActive: true } });
    if (!tariff) return reply.code(404).send({ error: "tariff_not_found" });

    const creditsRepo = app.db.getRepository(Credit);
    const paymentsRepo = app.db.getRepository(CreditPayment);

    const credit = await creditsRepo.save(
      creditsRepo.create({
        clientId,
        accountId,
        tariffId,
        principalAmount: toMoneyString(amount),
        outstandingAmount: toMoneyString(amount),
        status: "active",
        issuedAt: new Date(),
        nextPaymentDueAt: nowPlusDays(tariff.billingPeriodDays),
        closedAt: null,
      }),
    );

    const payment = await paymentsRepo.save(
      paymentsRepo.create({
        creditId: credit.id,
        amount: toMoneyString(amount),
        paymentType: "issue",
        performedBy: String(a.payload.sub ?? "unknown"),
        performedAt: new Date(),
      }),
    );

    await postAccountOperation({
      accountId,
      amount,
      kind: "credit",
      idempotencyKey: `credits:issue:${payment.id}`,
      metadata: { creditId: credit.id, clientId, tariffId },
    });

    return reply.code(201).send(credit);
  });

  app.post<{ Params: { id: string }; Body: { amount?: number } }>(
    "/credits/:id/repay",
    async (req, reply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });

      const amount = req.body?.amount;
      if (typeof amount !== "number" || amount <= 0) {
        return reply.code(400).send({ error: "invalid_amount" });
      }

      const creditsRepo = app.db.getRepository(Credit);
      const paymentsRepo = app.db.getRepository(CreditPayment);
      const existing = await creditsRepo.findOne({
        where: { id: req.params.id },
      });
      if (!existing) return reply.code(404).send({ error: "credit_not_found" });

      const isOwner = String(a.payload.sub ?? "") === existing.clientId;
      const allowed = isEmployee(a.payload) || isOwner;
      if (!allowed) return reply.code(403).send({ error: "forbidden" });
      if (existing.status !== "active")
        return reply.code(400).send({ error: "credit_not_active" });

      const current = Number(existing.outstandingAmount);
      const next = Math.max(0, current - amount);
      existing.outstandingAmount = toMoneyString(next);
      if (next === 0) {
        existing.status = "closed";
        existing.closedAt = new Date();
      }
      const savedCredit = await creditsRepo.save(existing);

      const payment = await paymentsRepo.save(
        paymentsRepo.create({
          creditId: savedCredit.id,
          amount: toMoneyString(amount),
          paymentType: "repayment",
          performedBy: String(a.payload.sub ?? "unknown"),
          performedAt: new Date(),
        }),
      );

      await postAccountOperation({
        accountId: savedCredit.accountId,
        amount,
        kind: "debit",
        idempotencyKey: `credits:repay:${payment.id}`,
        metadata: { creditId: savedCredit.id, clientId: savedCredit.clientId },
      });

      return reply.code(200).send({
        id: savedCredit.id,
        status: savedCredit.status,
        outstandingAmount: savedCredit.outstandingAmount,
        closedAt: savedCredit.closedAt,
      });
    },
  );

  app.post("/credits/accrue/run", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });
    if (!isEmployee(a.payload))
      return reply.code(403).send({ error: "forbidden" });
    const result = await accrueDueCredits(app.db);
    return reply.code(200).send(result);
  });

  app.get<{ Querystring: { clientIds?: string } }>(
    "/internal/credits/by-clients",
    async (req, reply) => {
      const token = req.headers["x-internal-token"];
      if (token !== env.internalToken) {
        return reply.code(401).send({ error: "unauthorized" });
      }
      const clientIdsRaw = req.query?.clientIds?.trim();
      if (!clientIdsRaw) return reply.code(200).send([]);
      const clientIds = clientIdsRaw
        .split(/[,\s]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      if (!clientIds.length) return reply.code(200).send([]);
      const credits = await app.db.getRepository(Credit).find({
        where: { clientId: In(clientIds) },
        order: { issuedAt: "DESC" },
      });
      return reply.code(200).send(credits);
    },
  );

  app.get<{ Params: { clientId: string } }>(
    "/credits/by-client/:clientId",
    async (req, reply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });

      const isOwner = String(a.payload.sub ?? "") === req.params.clientId;
      const allowed = isEmployee(a.payload) || isOwner;
      if (!allowed) return reply.code(403).send({ error: "forbidden" });

      const credits = await app.db.getRepository(Credit).find({
        where: { clientId: req.params.clientId },
        order: { issuedAt: "DESC" },
      });
      return reply.code(200).send(credits);
    },
  );

  app.get<{ Params: { id: string } }>("/credits/:id", async (req, reply) => {
    const payload = await safeVerify(req);
    const a = await requireActiveAuth(payload);
    if (!a.ok) return reply.code(a.code).send({ error: a.error });

    const credit = await app.db
      .getRepository(Credit)
      .findOne({ where: { id: req.params.id } });
    if (!credit) return reply.code(404).send({ error: "credit_not_found" });

    const isOwner = String(a.payload.sub ?? "") === credit.clientId;
    const allowed = isEmployee(a.payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    return reply.code(200).send(credit);
  });

  app.get<{ Params: { id: string } }>(
    "/credits/:id/payments",
    async (req, reply) => {
      const payload = await safeVerify(req);
      const a = await requireActiveAuth(payload);
      if (!a.ok) return reply.code(a.code).send({ error: a.error });

      const credit = await app.db
        .getRepository(Credit)
        .findOne({ where: { id: req.params.id } });
      if (!credit) return reply.code(404).send({ error: "credit_not_found" });

      const isOwner = String(a.payload.sub ?? "") === credit.clientId;
      const allowed = isEmployee(a.payload) || isOwner;
      if (!allowed) return reply.code(403).send({ error: "forbidden" });

      const payments = await app.db.getRepository(CreditPayment).find({
        where: { creditId: req.params.id },
        order: { performedAt: "DESC" },
      });
      return reply.code(200).send(payments);
    },
  );
}
