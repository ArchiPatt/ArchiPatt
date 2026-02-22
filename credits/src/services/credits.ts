import { DataSource, In } from "typeorm";
import { Credit } from "../db/entities/Credit";
import { CreditPayment } from "../db/entities/CreditPayment";
import { CreditTariff } from "../db/entities/CreditTariff";

function nowPlusDays(days: number): Date {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function toMoneyString(v: number): string {
  return v.toFixed(2);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export async function findActiveTariff(ds: DataSource, tariffId: string) {
  return await ds.getRepository(CreditTariff).findOne({ where: { id: tariffId, isActive: true } });
}

export async function issueCredit(
  ds: DataSource,
  input: {
    clientId: string;
    accountId: string;
    tariffId: string;
    amount: number;
    billingPeriodDays: number;
    performedBy: string;
  }
) {
  const creditsRepo = ds.getRepository(Credit);
  const paymentsRepo = ds.getRepository(CreditPayment);

  const credit = await creditsRepo.save(
    creditsRepo.create({
      clientId: input.clientId,
      accountId: input.accountId,
      tariffId: input.tariffId,
      principalAmount: toMoneyString(input.amount),
      outstandingAmount: toMoneyString(input.amount),
      status: "active",
      issuedAt: new Date(),
      nextPaymentDueAt: nowPlusDays(input.billingPeriodDays),
      closedAt: null
    })
  );

  const payment = await paymentsRepo.save(
    paymentsRepo.create({
      creditId: credit.id,
      amount: toMoneyString(input.amount),
      paymentType: "issue",
      performedBy: input.performedBy,
      performedAt: new Date()
    })
  );

  return { credit, payment };
}

export async function repayCredit(
  ds: DataSource,
  input: { creditId: string; amount: number; performedBy: string }
) {
  const creditsRepo = ds.getRepository(Credit);
  const paymentsRepo = ds.getRepository(CreditPayment);
  const credit = await creditsRepo.findOne({ where: { id: input.creditId } });
  if (!credit) return { kind: "not_found" as const };
  if (credit.status !== "active") return { kind: "not_active" as const };

  const current = Number(credit.outstandingAmount);
  const next = Math.max(0, current - input.amount);
  credit.outstandingAmount = toMoneyString(next);
  if (next === 0) {
    credit.status = "closed";
    credit.closedAt = new Date();
  }
  await creditsRepo.save(credit);

  const payment = await paymentsRepo.save(
    paymentsRepo.create({
      creditId: credit.id,
      amount: toMoneyString(input.amount),
      paymentType: "repayment",
      performedBy: input.performedBy,
      performedAt: new Date()
    })
  );

  return { kind: "ok" as const, credit, payment };
}

export async function listCreditsByClient(ds: DataSource, clientId: string) {
  return await ds.getRepository(Credit).find({ where: { clientId }, order: { issuedAt: "DESC" } });
}

export async function getCreditById(ds: DataSource, id: string) {
  return await ds.getRepository(Credit).findOne({ where: { id } });
}

export async function listPayments(ds: DataSource, creditId: string) {
  return await ds.getRepository(CreditPayment).find({ where: { creditId }, order: { performedAt: "DESC" } });
}

export async function accrueDueCredits(ds: DataSource, now: Date = new Date()) {
  const creditsRepo = ds.getRepository(Credit);
  const dueCredits = await creditsRepo.find({
    where: { status: "active" as const },
    order: { nextPaymentDueAt: "ASC" }
  });

  const effectiveDueCredits = dueCredits.filter((c) => c.nextPaymentDueAt.getTime() <= now.getTime());
  if (!effectiveDueCredits.length) {
    return { processedCredits: 0, accrualsCreated: 0, accruedTotal: "0.00" };
  }

  const tariffIds = [...new Set(effectiveDueCredits.map((c) => c.tariffId))];
  const tariffs = await ds.getRepository(CreditTariff).find({ where: { id: In(tariffIds), isActive: true } });
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

      const periodDays = tariff.billingPeriodDays > 0 ? tariff.billingPeriodDays : 1;
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
              performedAt: new Date()
            })
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

  return { processedCredits, accrualsCreated, accruedTotal: toMoneyString(accruedTotal) };
}

