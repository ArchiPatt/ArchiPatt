import { FastifyInstance } from "fastify";
import { CreditTariff } from "../db/entities/CreditTariff";
import { Credit } from "../db/entities/Credit";
import { CreditPayment } from "../db/entities/CreditPayment";
import { hasRole, verifyBearerToken } from "../security/jwt";

type CreateTariffBody = {
  name?: string;
  interestRate?: number;
  billingPeriodDays?: number;
};

type IssueCreditBody = {
  clientId?: string;
  accountId?: string;
  tariffId?: string;
  amount?: number;
};

type RepayBody = {
  amount?: number;
};

async function authPayloadOrNull(req: any): Promise<any | null> {
  try {
    return await verifyBearerToken(req.headers.authorization);
  } catch {
    return null;
  }
}

function isEmployee(payload: any): boolean {
  return hasRole(payload, "employee") || hasRole(payload, "admin");
}

function canManageAll(payload: any): boolean {
  return isEmployee(payload);
}

function nowPlusDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toMoneyString(v: number): string {
  return v.toFixed(2);
}

export function registerCreditsRoutes(app: FastifyInstance) {
  app.get("/tariffs", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    const repo = app.db.getRepository(CreditTariff);
    return await repo.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  });

  app.post<{ Body: CreateTariffBody }>("/tariffs", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    if (!canManageAll(payload))
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

  app.post<{ Body: IssueCreditBody }>("/credits/issue", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
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
    const isOwner = payload?.sub === clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    const tariffRepo = app.db.getRepository(CreditTariff);
    const tariff = await tariffRepo.findOne({
      where: { id: tariffId, isActive: true },
    });
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

    await paymentsRepo.save(
      paymentsRepo.create({
        creditId: credit.id,
        amount: toMoneyString(amount),
        paymentType: "issue",
        performedBy: String(payload?.sub ?? "unknown"),
        performedAt: new Date(),
      }),
    );

    return reply.code(201).send(credit);
  });

  app.post<{ Body: RepayBody }>("/credits/:id/repay", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    const creditId = (req.params as { id: string }).id;
    const amount = req.body?.amount;

    if (typeof amount !== "number" || amount <= 0) {
      return reply.code(400).send({ error: "invalid_amount" });
    }

    const creditsRepo = app.db.getRepository(Credit);
    const paymentsRepo = app.db.getRepository(CreditPayment);
    const credit = await creditsRepo.findOne({ where: { id: creditId } });
    if (!credit) return reply.code(404).send({ error: "credit_not_found" });
    if (credit.status !== "active")
      return reply.code(400).send({ error: "credit_not_active" });

    const isOwner = payload?.sub === credit.clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    const current = Number(credit.outstandingAmount);
    const next = Math.max(0, current - amount);
    credit.outstandingAmount = toMoneyString(next);
    if (next === 0) {
      credit.status = "closed";
      credit.closedAt = new Date();
    }
    await creditsRepo.save(credit);

    await paymentsRepo.save(
      paymentsRepo.create({
        creditId: credit.id,
        amount: toMoneyString(amount),
        paymentType: "repayment",
        performedBy: String(payload?.sub ?? "unknown"),
        performedAt: new Date(),
      }),
    );

    return {
      id: credit.id,
      status: credit.status,
      outstandingAmount: credit.outstandingAmount,
      closedAt: credit.closedAt,
    };
  });

  app.get("/credits/by-client/:clientId", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    const clientId = (req.params as { clientId: string }).clientId;
    const isOwner = payload?.sub === clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    const repo = app.db.getRepository(Credit);
    return await repo.find({
      where: { clientId },
      order: { issuedAt: "DESC" },
    });
  });

  app.get("/credits/:id", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    const id = (req.params as { id: string }).id;
    const repo = app.db.getRepository(Credit);
    const credit = await repo.findOne({ where: { id } });
    if (!credit) return reply.code(404).send({ error: "credit_not_found" });

    const isOwner = payload?.sub === credit.clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    return credit;
  });

  app.get("/credits/:id/payments", async (req, reply) => {
    const payload = await authPayloadOrNull(req);
    if (!payload) return reply.code(401).send({ error: "unauthorized" });
    const id = (req.params as { id: string }).id;
    const creditsRepo = app.db.getRepository(Credit);
    const credit = await creditsRepo.findOne({ where: { id } });
    if (!credit) return reply.code(404).send({ error: "credit_not_found" });

    const isOwner = payload?.sub === credit.clientId;
    const allowed = isEmployee(payload) || isOwner;
    if (!allowed) return reply.code(403).send({ error: "forbidden" });

    const repo = app.db.getRepository(CreditPayment);
    return await repo.find({
      where: { creditId: id },
      order: { performedAt: "DESC" },
    });
  });
}
