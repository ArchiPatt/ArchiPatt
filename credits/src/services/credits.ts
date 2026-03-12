import { DataSource, In } from "typeorm";
import { Credit } from "../db/entities/Credit";
import { CreditPayment } from "../db/entities/CreditPayment";
import { CreditTariff } from "../db/entities/CreditTariff";
import { CreditStatus } from "../db/enums/CreditStatus";
import {
  transferFromMaster,
  transferToMaster,
} from "../integrations/core-service";

function toMoneyString(v: number): string {
  return v.toFixed(2);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function nowPlusDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function findActiveTariffs(ds: DataSource) {
  return ds.getRepository(CreditTariff).find({
    where: { isActive: true },
    order: { createdAt: "DESC" },
  });
}

export async function findTariffById(ds: DataSource, id: string) {
  return ds.getRepository(CreditTariff).findOne({ where: { id } });
}

export async function findTariffByName(ds: DataSource, name: string) {
  return ds.getRepository(CreditTariff).findOne({ where: { name } });
}

export async function createTariff(
  ds: DataSource,
  params: {
    name: string;
    interestRate: string;
    billingPeriodDays: number;
  },
) {
  const repo = ds.getRepository(CreditTariff);
  return repo.save(
    repo.create({
      ...params,
      isActive: true,
    }),
  );
}

export async function findCredits(ds: DataSource) {
  return ds.getRepository(Credit).find({
    order: { issuedAt: "DESC" },
  });
}

export async function findCreditsByClientIds(
  ds: DataSource,
  clientIds: string[],
) {
  if (clientIds.length === 0) {
    return ds.getRepository(Credit).find({
      order: { issuedAt: "DESC" },
    });
  }
  return ds.getRepository(Credit).find({
    where: { clientId: In(clientIds) },
    order: { issuedAt: "DESC" },
  });
}

export async function findOverdueCredits(
  ds: DataSource,
  clientId?: string,
  now: Date = new Date(),
) {
  const repo = ds.getRepository(Credit);
  const where: { status: CreditStatus; clientId?: string } = {
    status: CreditStatus.Active,
  };
  if (clientId) where.clientId = clientId;

  const credits = await repo.find({
    where,
    order: { nextPaymentDueAt: "ASC" },
  });
  return credits.filter((c) => c.nextPaymentDueAt.getTime() <= now.getTime());
}

export async function calculateCreditRating(
  ds: DataSource,
  clientId: string,
  now: Date = new Date(),
): Promise<{ score: number; overdueCount: number; totalCredits: number; closedCount: number }> {
  const credits = await ds.getRepository(Credit).find({
    where: { clientId },
    order: { issuedAt: "DESC" },
  });

  const overdueCredits = credits.filter(
    (c) =>
      c.status === CreditStatus.Active &&
      c.nextPaymentDueAt.getTime() <= now.getTime(),
  );
  const closedCredits = credits.filter((c) => c.status === CreditStatus.Closed);

  const overdueCount = overdueCredits.length;
  const totalCredits = credits.length;
  const closedCount = closedCredits.length;

  const score = Math.max(
    0,
    Math.min(100, 100 - overdueCount * 20 + closedCount * 3),
  );

  return {
    score: Math.round(score),
    overdueCount,
    totalCredits,
    closedCount,
  };
}

export async function findCreditById(ds: DataSource, id: string) {
  return ds.getRepository(Credit).findOne({ where: { id } });
}

export async function findPaymentsByCreditId(ds: DataSource, creditId: string) {
  return ds.getRepository(CreditPayment).find({
    where: { creditId },
    order: { performedAt: "DESC" },
  });
}

export async function issueCredit(
  ds: DataSource,
  params: {
    clientId: string;
    accountId: string;
    tariffId: string;
    amount: number;
    performedBy: string;
    authorization?: string;
  },
) {
  const tariff = await findTariffById(ds, params.tariffId);
  if (!tariff || !tariff.isActive) return null;

  const creditsRepo = ds.getRepository(Credit);
  const paymentsRepo = ds.getRepository(CreditPayment);

  const credit = await creditsRepo.save(
    creditsRepo.create({
      clientId: params.clientId,
      accountId: params.accountId,
      tariffId: params.tariffId,
      principalAmount: toMoneyString(params.amount),
      outstandingAmount: toMoneyString(params.amount),
      status: CreditStatus.Active,
      issuedAt: new Date(),
      nextPaymentDueAt: nowPlusDays(tariff.billingPeriodDays),
      closedAt: null,
    }),
  );

  const payment = await paymentsRepo.save(
    paymentsRepo.create({
      creditId: credit.id,
      amount: toMoneyString(params.amount),
      paymentType: "issue",
      performedBy: params.performedBy,
      performedAt: new Date(),
    }),
  );

  await transferFromMaster({
    toAccountId: params.accountId,
    amount: params.amount,
    idempotencyKey: `credits:issue:${payment.id}`,
    metadata: {
      creditId: credit.id,
      clientId: params.clientId,
      tariffId: params.tariffId,
    },
    authorization: params.authorization,
  });

  return credit;
}

export async function repayCredit(
  ds: DataSource,
  params: {
    creditId: string;
    amount: number;
    performedBy: string;
    authorization?: string;
  },
) {
  const credit = await findCreditById(ds, params.creditId);
  if (!credit) return null;
  if (credit.status !== CreditStatus.Active) return "not_active";

  const current = Number(credit.outstandingAmount);
  const next = Math.max(0, current - params.amount);
  credit.outstandingAmount = toMoneyString(next);
  if (next === 0) {
    credit.status = CreditStatus.Closed;
    credit.closedAt = new Date();
  }
  const savedCredit = await ds.getRepository(Credit).save(credit);

  const paymentsRepo = ds.getRepository(CreditPayment);
  const payment = await paymentsRepo.save(
    paymentsRepo.create({
      creditId: savedCredit.id,
      amount: toMoneyString(params.amount),
      paymentType: "repayment",
      performedBy: params.performedBy,
      performedAt: new Date(),
    }),
  );

  await transferToMaster({
    fromAccountId: savedCredit.accountId,
    amount: params.amount,
    idempotencyKey: `credits:repay:${payment.id}`,
    metadata: {
      creditId: savedCredit.id,
      clientId: savedCredit.clientId,
    },
    authorization: params.authorization,
  });

  return {
    id: savedCredit.id,
    status: savedCredit.status,
    outstandingAmount: savedCredit.outstandingAmount,
    closedAt: savedCredit.closedAt,
  };
}

export async function accrueDueCredits(
  ds: DataSource,
  now: Date = new Date(),
) {
  const creditsRepo = ds.getRepository(Credit);
  const dueCredits = await creditsRepo.find({
    where: { status: CreditStatus.Active },
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
