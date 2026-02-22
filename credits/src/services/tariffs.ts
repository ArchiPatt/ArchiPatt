import { DataSource } from "typeorm";
import { CreditTariff } from "../db/entities/CreditTariff";

export async function listActiveTariffs(ds: DataSource) {
  return await ds.getRepository(CreditTariff).find({
    where: { isActive: true },
    order: { createdAt: "DESC" }
  });
}

export async function createTariff(
  ds: DataSource,
  input: { name: string; interestRate: number; billingPeriodDays: number }
) {
  const repo = ds.getRepository(CreditTariff);
  const exists = await repo.findOne({ where: { name: input.name } });
  if (exists) {
    return { kind: "conflict" as const };
  }

  const tariff = await repo.save(
    repo.create({
      name: input.name,
      interestRate: input.interestRate.toFixed(4),
      billingPeriodDays: input.billingPeriodDays,
      isActive: true
    })
  );
  return { kind: "ok" as const, tariff };
}

