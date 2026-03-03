import { DataSource, EntityManager, In } from "typeorm";
import { Account } from "../db/entities/Account";
import { AccountOperation } from "../db/entities/AccountOperation";
import { AccountStatus } from "../db/enums/AccountStatus";

export async function findAccounts(
  ds: DataSource,
  opts: { clientId?: string },
) {
  const repo = ds.getRepository(Account);
  return repo.find({
    where: opts.clientId ? { clientId: opts.clientId } : {},
    order: { createdAt: "DESC" },
  });
}

export async function findAccountById(ds: DataSource, id: string) {
  return ds.getRepository(Account).findOne({ where: { id } });
}

export async function findAccountsByClientIds(
  ds: DataSource,
  clientIds: string[],
) {
  if (clientIds.length === 0) return [];
  return ds.getRepository(Account).find({
    where: { clientId: In(clientIds) },
    order: { createdAt: "DESC" },
  });
}

export async function createAccount(
  ds: DataSource,
  clientId: string,
) {
  const repo = ds.getRepository(Account);
  return repo.save(
    repo.create({ clientId, balance: "0", status: AccountStatus.Open }),
  );
}

export async function closeAccount(ds: DataSource, account: Account) {
  account.status = AccountStatus.Closed;
  await ds.getRepository(Account).save(account);
  return account;
}

export async function findOperations(
  ds: DataSource,
  accountId: string,
  opts: { limit: number; offset: number; sort: "ASC" | "DESC" },
) {
  const [items, total] = await ds
    .getRepository(AccountOperation)
    .findAndCount({
      where: { accountId },
      order: { createdAt: opts.sort },
      take: opts.limit,
      skip: opts.offset,
    });
  return { items, total };
}

export async function findOperationByIdempotency(
  ds: DataSource,
  accountId: string,
  idempotencyKey: string,
) {
  return ds.getRepository(AccountOperation).findOne({
    where: { accountId, idempotencyKey },
  });
}

export function parseAmount(v: unknown): number | null {
  const n =
    typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function deposit(
  em: EntityManager,
  accountId: string,
  amount: number,
) {
  const account = await em.findOne(Account, {
    where: { id: accountId },
    lock: { mode: "pessimistic_write" },
  });
  if (!account) return null;
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
}

export async function withdraw(
  em: EntityManager,
  accountId: string,
  amount: number,
) {
  const account = await em.findOne(Account, {
    where: { id: accountId },
    lock: { mode: "pessimistic_write" },
  });
  if (!account) return null;
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
}

export async function postOperation(
  em: EntityManager,
  params: {
    accountId: string;
    amount: number;
    type?: string | null;
    correlationId?: string | null;
    idempotencyKey: string;
    meta?: Record<string, unknown> | null;
  },
) {
  const dup = await em.findOne(AccountOperation, {
    where: {
      accountId: params.accountId,
      idempotencyKey: params.idempotencyKey,
    },
  });
  if (dup) return { op: dup, created: false };

  const account = await em.findOne(Account, {
    where: { id: params.accountId },
    lock: { mode: "pessimistic_write" },
  });
  if (!account) return null;
  if (account.status === AccountStatus.Closed) return "closed";

  const prev = parseFloat(account.balance);
  const next = (prev + params.amount).toFixed(2);
  if (parseFloat(next) < 0) return "insufficient_balance";

  account.balance = next;
  await em.save(account);
  const op = await em.save(
    em.create(AccountOperation, {
      accountId: account.id,
      amount: params.amount.toFixed(2),
      type: params.type ?? null,
      correlationId: params.correlationId ?? null,
      idempotencyKey: params.idempotencyKey,
      meta: params.meta ?? null,
    }),
  );
  return { op, created: true };
}
