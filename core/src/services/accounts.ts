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

export async function createAccount(ds: DataSource, clientId: string) {
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
  const [items, total] = await ds.getRepository(AccountOperation).findAndCount({
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

export async function transferFromMaster(
  em: EntityManager,
  params: {
    masterAccountId: string;
    toAccountId: string;
    amount: number;
    idempotencyKey: string;
    type?: string | null;
    meta?: Record<string, unknown> | null;
  },
) {
  const clientKey = `${params.idempotencyKey}:client`;
  const existing = await em.findOne(AccountOperation, {
    where: { accountId: params.toAccountId, idempotencyKey: clientKey },
  });
  if (existing) return { success: true };

  const master = await em.findOne(Account, {
    where: { id: params.masterAccountId },
    lock: { mode: "pessimistic_write" },
  });
  const toAccount = await em.findOne(Account, {
    where: { id: params.toAccountId },
    lock: { mode: "pessimistic_write" },
  });
  if (!master || !toAccount) return null;
  if (
    master.status === AccountStatus.Closed ||
    toAccount.status === AccountStatus.Closed
  )
    return "closed";

  const masterPrev = parseFloat(master.balance);
  const masterNext = (masterPrev - params.amount).toFixed(2);
  if (parseFloat(masterNext) < 0) return "insufficient_balance";

  const toPrev = parseFloat(toAccount.balance);
  const toNext = (toPrev + params.amount).toFixed(2);

  master.balance = masterNext;
  toAccount.balance = toNext;
  await em.save(master);
  await em.save(toAccount);

  await em.save(
    em.create(AccountOperation, {
      accountId: master.id,
      amount: (-params.amount).toFixed(2),
      type: params.type ?? "credit_issue_from_master",
      idempotencyKey: `${params.idempotencyKey}:master`,
      meta: params.meta ?? null,
    }),
  );
  await em.save(
    em.create(AccountOperation, {
      accountId: toAccount.id,
      amount: params.amount.toFixed(2),
      type: params.type ?? "credit_issue",
      idempotencyKey: `${params.idempotencyKey}:client`,
      meta: params.meta ?? null,
    }),
  );
  return { success: true };
}

export async function transferToMaster(
  em: EntityManager,
  params: {
    masterAccountId: string;
    fromAccountId: string;
    amount: number;
    idempotencyKey: string;
    type?: string | null;
    meta?: Record<string, unknown> | null;
  },
) {
  const clientKey = `${params.idempotencyKey}:client`;
  const existing = await em.findOne(AccountOperation, {
    where: { accountId: params.fromAccountId, idempotencyKey: clientKey },
  });
  if (existing) return { success: true };

  const master = await em.findOne(Account, {
    where: { id: params.masterAccountId },
    lock: { mode: "pessimistic_write" },
  });
  const fromAccount = await em.findOne(Account, {
    where: { id: params.fromAccountId },
    lock: { mode: "pessimistic_write" },
  });
  if (!master || !fromAccount) return null;
  if (
    master.status === AccountStatus.Closed ||
    fromAccount.status === AccountStatus.Closed
  )
    return "closed";

  const fromPrev = parseFloat(fromAccount.balance);
  const fromNext = (fromPrev - params.amount).toFixed(2);
  if (parseFloat(fromNext) < 0) return "insufficient_balance";

  const masterPrev = parseFloat(master.balance);
  const masterNext = (masterPrev + params.amount).toFixed(2);

  fromAccount.balance = fromNext;
  master.balance = masterNext;
  await em.save(fromAccount);
  await em.save(master);

  await em.save(
    em.create(AccountOperation, {
      accountId: fromAccount.id,
      amount: (-params.amount).toFixed(2),
      type: params.type ?? "credit_repayment",
      idempotencyKey: `${params.idempotencyKey}:client`,
      meta: params.meta ?? null,
    }),
  );
  await em.save(
    em.create(AccountOperation, {
      accountId: master.id,
      amount: params.amount.toFixed(2),
      type: params.type ?? "credit_repayment_to_master",
      idempotencyKey: `${params.idempotencyKey}:master`,
      meta: params.meta ?? null,
    }),
  );
  return { success: true };
}

export async function transferBetweenAccounts(
  em: EntityManager,
  params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    idempotencyKey?: string | null;
  },
): Promise<
  | { success: true }
  | null
  | "same_account"
  | "closed"
  | "insufficient_balance"
  | "account_not_found"
> {
  if (params.fromAccountId === params.toAccountId) return "same_account";

  const idempotencyKey = params.idempotencyKey?.trim();
  if (idempotencyKey) {
    const existing = await em.findOne(AccountOperation, {
      where: {
        accountId: params.fromAccountId,
        idempotencyKey,
        type: "transfer_out",
      },
    });
    if (existing) return { success: true };
  }

  const [idFirst, idSecond] =
    params.fromAccountId < params.toAccountId
      ? [params.fromAccountId, params.toAccountId]
      : [params.toAccountId, params.fromAccountId];
  const [first, second] = await Promise.all([
    em.findOne(Account, {
      where: { id: idFirst },
      lock: { mode: "pessimistic_write" },
    }),
    em.findOne(Account, {
      where: { id: idSecond },
      lock: { mode: "pessimistic_write" },
    }),
  ]);
  const fromAccount = first?.id === params.fromAccountId ? first : second;
  const toAccount = first?.id === params.toAccountId ? first : second;

  if (!fromAccount || !toAccount) return "account_not_found";
  if (
    fromAccount.status === AccountStatus.Closed ||
    toAccount.status === AccountStatus.Closed
  )
    return "closed";

  const fromPrev = parseFloat(fromAccount.balance);
  const fromNext = (fromPrev - params.amount).toFixed(2);
  if (parseFloat(fromNext) < 0) return "insufficient_balance";

  const toPrev = parseFloat(toAccount.balance);
  const toNext = (toPrev + params.amount).toFixed(2);

  fromAccount.balance = fromNext;
  toAccount.balance = toNext;
  await em.save(fromAccount);
  await em.save(toAccount);

  const correlationId = crypto.randomUUID();
  await em.save(
    em.create(AccountOperation, {
      accountId: fromAccount.id,
      amount: (-params.amount).toFixed(2),
      type: "transfer_out",
      correlationId,
      idempotencyKey: idempotencyKey ?? null,
      meta: { toAccountId: params.toAccountId },
    }),
  );
  await em.save(
    em.create(AccountOperation, {
      accountId: toAccount.id,
      amount: params.amount.toFixed(2),
      type: "transfer_in",
      correlationId,
      idempotencyKey: null,
      meta: { fromAccountId: params.fromAccountId },
    }),
  );
  return { success: true };
}
