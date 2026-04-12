import { DataSource, EntityManager, In } from "typeorm";
import { Account } from "../db/entities/Account";
import { AccountOperation } from "../db/entities/AccountOperation";
import { AccountStatus } from "../db/enums/AccountStatus";
import { Currency, isSupportedCurrency } from "../db/enums/Currency";
import * as exchangeRates from "./exchange-rates";

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
  currency: Currency = Currency.RUB,
) {
  if (!isSupportedCurrency(currency)) {
    throw new Error(`Unsupported currency: ${currency}`);
  }
  const repo = ds.getRepository(Account);
  return repo.save(
    repo.create({
      clientId,
      currency,
      balance: "0",
      status: AccountStatus.Open,
    }),
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

/**
 * Последние операции по всем счетам (снимок для WS сотрудников)
 */
export async function findRecentOperationsGlobally(
  ds: DataSource,
  opts: { limit: number },
) {
  const repo = ds.getRepository(AccountOperation);
  const total = await repo.count();
  const items = await repo.find({
    order: { createdAt: "DESC" },
    take: opts.limit,
  });
  return { items, total };
}

export async function findRecentOperationsForClient(
  ds: DataSource,
  clientId: string,
  opts: { limit: number },
) {
  const qb = ds
    .getRepository(AccountOperation)
    .createQueryBuilder("op")
    .innerJoin(Account, "acc", "acc.id = op.accountId")
    .where("acc.clientId = :clientId", { clientId })
    .orderBy("op.createdAt", "DESC")
    .take(opts.limit);
  const items = await qb.getMany();
  const total = await ds
    .getRepository(AccountOperation)
    .createQueryBuilder("op")
    .innerJoin(Account, "acc", "acc.id = op.accountId")
    .where("acc.clientId = :clientId", { clientId })
    .getCount();
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

export function parseCurrency(v: unknown): Currency {
  if (typeof v !== "string" || !v) return Currency.RUB;
  return isSupportedCurrency(v) ? (v as Currency) : Currency.RUB;
}

export async function deposit(
  em: EntityManager,
  accountId: string,
  amount: number,
  idempotencyKey?: string | null,
): Promise<
  { account: Account; operation: AccountOperation } | null | "closed"
> {
  if (idempotencyKey) {
    const existing = await em.findOne(AccountOperation, {
      where: { accountId, idempotencyKey, type: "deposit" },
    });
    if (existing) {
      const account = await em.findOne(Account, { where: { id: accountId } });
      if (account) return { account, operation: existing };
    }
  }

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
  const operation = await em.save(
    em.create(AccountOperation, {
      accountId: account.id,
      amount: amount.toFixed(2),
      type: "deposit",
      idempotencyKey: idempotencyKey ?? null,
    }),
  );
  return { account, operation };
}

export async function withdraw(
  em: EntityManager,
  accountId: string,
  amount: number,
  idempotencyKey?: string | null,
): Promise<
  | { account: Account; operation: AccountOperation }
  | null
  | "closed"
  | "insufficient_balance"
> {
  if (idempotencyKey) {
    const existing = await em.findOne(AccountOperation, {
      where: { accountId, idempotencyKey, type: "withdraw" },
    });
    if (existing) {
      const account = await em.findOne(Account, { where: { id: accountId } });
      if (account) return { account, operation: existing };
    }
  }

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
  const operation = await em.save(
    em.create(AccountOperation, {
      accountId: account.id,
      amount: (-amount).toFixed(2),
      type: "withdraw",
      idempotencyKey: idempotencyKey ?? null,
    }),
  );
  return { account, operation };
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
  if (dup) {
    const account = await em.findOne(Account, { where: { id: dup.accountId } });
    return {
      op: dup,
      created: false,
      clientId: account?.clientId,
    };
  }

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
  return { op, created: true, clientId: account.clientId };
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
): Promise<
  | { success: true; toAccountOperation: AccountOperation; toClientId: string }
  | null
  | "closed"
  | "insufficient_balance"
  | "exchange_rate_unavailable"
> {
  const clientKey = `${params.idempotencyKey}:client`;
  const existing = await em.findOne(AccountOperation, {
    where: { accountId: params.toAccountId, idempotencyKey: clientKey },
  });
  if (existing) {
    const acc = await em.findOne(Account, { where: { id: params.toAccountId } });
    return {
      success: true,
      toAccountOperation: existing,
      toClientId: acc?.clientId ?? "",
    };
  }

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

  let masterDebitAmount = params.amount;
  const toCreditAmount = params.amount;
  let masterMeta = params.meta ?? null;
  let toMeta = params.meta ?? null;

  if (master.currency !== toAccount.currency) {
    try {
      const rate = await exchangeRates.getExchangeRate(
        toAccount.currency as Currency,
        master.currency as Currency,
      );
      masterDebitAmount = Math.round(params.amount * rate * 100) / 100;
      masterMeta = {
        ...(params.meta as Record<string, unknown>),
        fromCurrency: toAccount.currency,
        toCurrency: master.currency,
        toAmount: params.amount,
        fromAmount: masterDebitAmount,
        exchangeRate: rate,
      };
      toMeta = {
        ...(params.meta as Record<string, unknown>),
        fromCurrency: master.currency,
        toCurrency: toAccount.currency,
        fromAmount: masterDebitAmount,
        toAmount: params.amount,
        exchangeRate: rate,
      };
    } catch {
      return "exchange_rate_unavailable";
    }
  }

  const masterPrev = parseFloat(master.balance);
  const masterNext = (masterPrev - masterDebitAmount).toFixed(2);
  if (parseFloat(masterNext) < 0) return "insufficient_balance";

  const toPrev = parseFloat(toAccount.balance);
  const toNext = (toPrev + toCreditAmount).toFixed(2);

  master.balance = masterNext;
  toAccount.balance = toNext;
  await em.save(master);
  await em.save(toAccount);

  await em.save(
    em.create(AccountOperation, {
      accountId: master.id,
      amount: (-masterDebitAmount).toFixed(2),
      type: params.type ?? "credit_issue_from_master",
      idempotencyKey: `${params.idempotencyKey}:master`,
      meta: masterMeta,
    }),
  );
  const toAccountOperation = await em.save(
    em.create(AccountOperation, {
      accountId: toAccount.id,
      amount: toCreditAmount.toFixed(2),
      type: params.type ?? "credit_issue",
      idempotencyKey: `${params.idempotencyKey}:client`,
      meta: toMeta,
    }),
  );
  return {
    success: true,
    toAccountOperation,
    toClientId: toAccount.clientId,
  };
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
): Promise<
  | { success: true; fromAccountOperation: AccountOperation; fromClientId: string }
  | null
  | "closed"
  | "insufficient_balance"
  | "exchange_rate_unavailable"
> {
  const clientKey = `${params.idempotencyKey}:client`;
  const existing = await em.findOne(AccountOperation, {
    where: { accountId: params.fromAccountId, idempotencyKey: clientKey },
  });
  if (existing) {
    const acc = await em.findOne(Account, {
      where: { id: params.fromAccountId },
    });
    return {
      success: true,
      fromAccountOperation: existing,
      fromClientId: acc?.clientId ?? "",
    };
  }

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

  const fromDebitAmount = params.amount;
  let masterCreditAmount = params.amount;
  let fromMeta = params.meta ?? null;
  let masterMeta = params.meta ?? null;

  if (master.currency !== fromAccount.currency) {
    try {
      const rate = await exchangeRates.getExchangeRate(
        fromAccount.currency as Currency,
        master.currency as Currency,
      );
      masterCreditAmount = Math.round(params.amount * rate * 100) / 100;
      fromMeta = {
        ...(params.meta as Record<string, unknown>),
        fromCurrency: fromAccount.currency,
        toCurrency: master.currency,
        fromAmount: params.amount,
        toAmount: masterCreditAmount,
        exchangeRate: rate,
      };
      masterMeta = {
        ...(params.meta as Record<string, unknown>),
        fromCurrency: fromAccount.currency,
        toCurrency: master.currency,
        fromAmount: params.amount,
        toAmount: masterCreditAmount,
        exchangeRate: rate,
      };
    } catch {
      return "exchange_rate_unavailable";
    }
  }

  const fromPrev = parseFloat(fromAccount.balance);
  const fromNext = (fromPrev - fromDebitAmount).toFixed(2);
  if (parseFloat(fromNext) < 0) return "insufficient_balance";

  const masterPrev = parseFloat(master.balance);
  const masterNext = (masterPrev + masterCreditAmount).toFixed(2);

  fromAccount.balance = fromNext;
  master.balance = masterNext;
  await em.save(fromAccount);
  await em.save(master);

  const fromAccountOperation = await em.save(
    em.create(AccountOperation, {
      accountId: fromAccount.id,
      amount: (-fromDebitAmount).toFixed(2),
      type: params.type ?? "credit_repayment",
      idempotencyKey: `${params.idempotencyKey}:client`,
      meta: fromMeta,
    }),
  );
  await em.save(
    em.create(AccountOperation, {
      accountId: master.id,
      amount: masterCreditAmount.toFixed(2),
      type: params.type ?? "credit_repayment_to_master",
      idempotencyKey: `${params.idempotencyKey}:master`,
      meta: masterMeta,
    }),
  );
  return {
    success: true,
    fromAccountOperation,
    fromClientId: fromAccount.clientId,
  };
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
  | {
      success: true;
      fromOperation: AccountOperation;
      toOperation: AccountOperation;
      fromClientId: string;
      toClientId: string;
    }
  | null
  | "same_account"
  | "closed"
  | "insufficient_balance"
  | "account_not_found"
  | "exchange_rate_unavailable"
> {
  if (params.fromAccountId === params.toAccountId) return "same_account";

  const idempotencyKey = params.idempotencyKey?.trim();
  if (idempotencyKey) {
    const existingOut = await em.findOne(AccountOperation, {
      where: {
        accountId: params.fromAccountId,
        idempotencyKey,
        type: "transfer_out",
      },
    });
    if (existingOut?.correlationId) {
      const existingIn = await em.findOne(AccountOperation, {
        where: {
          accountId: params.toAccountId,
          correlationId: existingOut.correlationId,
          type: "transfer_in",
        },
      });
      if (existingIn) {
        const [fromAcc, toAcc] = await Promise.all([
          em.findOne(Account, { where: { id: params.fromAccountId } }),
          em.findOne(Account, { where: { id: params.toAccountId } }),
        ]);
        return {
          success: true,
          fromOperation: existingOut,
          toOperation: existingIn,
          fromClientId: fromAcc?.clientId ?? "",
          toClientId: toAcc?.clientId ?? "",
        };
      }
    }
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

  let debitAmount = params.amount;
  let creditAmount = params.amount;
  let metaFrom: Record<string, unknown> = { toAccountId: params.toAccountId };
  let metaTo: Record<string, unknown> = {
    fromAccountId: params.fromAccountId,
  };

  if (fromAccount.currency !== toAccount.currency) {
    try {
      const rate = await exchangeRates.getExchangeRate(
        fromAccount.currency as Currency,
        toAccount.currency as Currency,
      );
      creditAmount = Math.round(params.amount * rate * 100) / 100;
      metaFrom = {
        ...metaFrom,
        fromCurrency: fromAccount.currency,
        toCurrency: toAccount.currency,
        fromAmount: params.amount,
        toAmount: creditAmount,
        exchangeRate: rate,
      };
      metaTo = {
        ...metaTo,
        fromCurrency: fromAccount.currency,
        toCurrency: toAccount.currency,
        fromAmount: params.amount,
        toAmount: creditAmount,
        exchangeRate: rate,
      };
    } catch {
      return "exchange_rate_unavailable";
    }
  }

  const fromPrev = parseFloat(fromAccount.balance);
  const fromNext = (fromPrev - debitAmount).toFixed(2);
  if (parseFloat(fromNext) < 0) return "insufficient_balance";

  const toPrev = parseFloat(toAccount.balance);
  const toNext = (toPrev + creditAmount).toFixed(2);

  fromAccount.balance = fromNext;
  toAccount.balance = toNext;
  await em.save(fromAccount);
  await em.save(toAccount);

  const correlationId = crypto.randomUUID();
  const fromOperation = await em.save(
    em.create(AccountOperation, {
      accountId: fromAccount.id,
      amount: (-debitAmount).toFixed(2),
      type: "transfer_out",
      correlationId,
      idempotencyKey: idempotencyKey ?? null,
      meta: metaFrom,
    }),
  );
  const toOperation = await em.save(
    em.create(AccountOperation, {
      accountId: toAccount.id,
      amount: creditAmount.toFixed(2),
      type: "transfer_in",
      correlationId,
      idempotencyKey: null,
      meta: metaTo,
    }),
  );
  return {
    success: true,
    fromOperation,
    toOperation,
    fromClientId: fromAccount.clientId,
    toClientId: toAccount.clientId,
  };
}
