import { DataSource } from "typeorm";
import { HiddenAccount } from "../db/entities/HiddenAccount";

export async function getHiddenAccounts(
  ds: DataSource,
  userId: string,
): Promise<string[]> {
  const repo = ds.getRepository(HiddenAccount);
  const records = await repo.find({
    where: { userId },
    order: { createdAt: "ASC" },
  });
  return records.map((r) => r.accountId);
}

export async function addHiddenAccount(
  ds: DataSource,
  userId: string,
  accountId: string,
): Promise<{ created: boolean }> {
  const repo = ds.getRepository(HiddenAccount);

  const existing = await repo.findOneBy({ userId, accountId });
  if (existing) return { created: false };

  const record = repo.create({ userId, accountId });
  await repo.save(record);
  return { created: true };
}

export async function removeHiddenAccount(
  ds: DataSource,
  userId: string,
  accountId: string,
): Promise<{ deleted: boolean }> {
  const repo = ds.getRepository(HiddenAccount);

  const existing = await repo.findOneBy({ userId, accountId });
  if (!existing) return { deleted: false };

  await repo.remove(existing);
  return { deleted: true };
}
