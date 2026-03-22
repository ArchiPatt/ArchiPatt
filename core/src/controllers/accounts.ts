import { DataSource } from "typeorm";
import { env } from "../env";
import { JWTPayload } from "jose";
import { AccountStatus } from "../db/enums/AccountStatus";
import {
  canReadAccount,
  canManageAll,
  canCreateAccountFor,
  canCloseAccount,
} from "../security/access";
import { verifyBearerToken } from "../security/jwt";
import * as accountsService from "../services/accounts";

export async function listAccountsController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId?: string },
) {
  if (canManageAll(payload)) {
    const items = await accountsService.findAccounts(ds, {
      clientId: params.clientId,
    });
    return { status: 200, body: items };
  }

  if (!payload.sub) return { status: 403, body: { error: "forbidden" } };
  const items = await accountsService.findAccounts(ds, {
    clientId: payload.sub,
  });
  return { status: 200, body: items };
}

export async function getAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const account = await accountsService.findAccountById(ds, params.id);
  if (!account) return { status: 404, body: { error: "account_not_found" } };

  if (!canReadAccount(payload, account.clientId)) {
    return { status: 403, body: { error: "forbidden" } };
  }

  return { status: 200, body: account };
}

export async function getMasterAccountController(
  ds: DataSource,
  _payload: JWTPayload,
) {
  const account = await accountsService.findAccountById(ds, env.masterAccountId);
  if (!account) return { status: 404, body: { error: "account_not_found" } };

  return {
    status: 200,
    body: {
      id: account.id,
      clientId: account.clientId,
      currency: account.currency,
      balance: account.balance,
      status: account.status,
      createdAt: account.createdAt,
    },
  };
}

export async function getOperationsController(
  ds: DataSource,
  payload: JWTPayload,
  params: {
    id: string;
    limit?: number;
    offset?: number;
    sort?: string;
  },
) {
  const account = await accountsService.findAccountById(ds, params.id);
  if (!account) return { status: 404, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId)) {
    return { status: 403, body: { error: "forbidden" } };
  }

  const limit = Math.min(Math.max(1, params.limit ?? 20), 100);
  const offset = Math.max(0, params.offset ?? 0);
  const sort = params.sort === "asc" ? "ASC" : "DESC";

  const { items, total } = await accountsService.findOperations(ds, params.id, {
    limit,
    offset,
    sort,
  });

  return { status: 200, body: { items, total } };
}

export async function createAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId?: string; currency?: string },
) {
  if (!payload.sub) return { status: 403, body: { error: "forbidden" } };

  const clientId = canManageAll(payload)
    ? (params.clientId ?? payload.sub)
    : payload.sub;
  if (!canCreateAccountFor(payload, clientId)) {
    return { status: 403, body: { error: "forbidden" } };
  }

  const currency = accountsService.parseCurrency(params.currency);
  const account = await accountsService.createAccount(ds, clientId, currency);
  return { status: 201, body: account };
}

export async function closeAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const account = await accountsService.findAccountById(ds, params.id);
  if (!account) return { status: 404, body: { error: "account_not_found" } };
  if (!canCloseAccount(payload, account.clientId)) {
    return { status: 403, body: { error: "forbidden" } };
  }
  if (account.status === AccountStatus.Closed) {
    return { status: 400, body: { error: "account_already_closed" } };
  }

  const closed = await accountsService.closeAccount(ds, account);
  return { status: 200, body: closed };
}

export async function depositController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string; amount?: unknown },
) {
  const amount = accountsService.parseAmount(params.amount);
  if (amount == null) return { status: 400, body: { error: "invalid_amount" } };

  const account = await accountsService.findAccountById(ds, params.id);
  if (!account) return { status: 404, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId))
    return { status: 403, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.deposit(em, params.id, amount),
  );

  if (!result) return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  return { status: 200, body: result.account, operation: result.operation };
}

export async function withdrawController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string; amount?: unknown },
) {
  const amount = accountsService.parseAmount(params.amount);
  if (amount == null) return { status: 400, body: { error: "invalid_amount" } };

  const account = await accountsService.findAccountById(ds, params.id);
  if (!account) return { status: 404, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId))
    return { status: 403, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.withdraw(em, params.id, amount),
  );

  if (!result) return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400, body: { error: "insufficient_balance" } };
  return { status: 200, body: result.account, operation: result.operation };
}

export async function internalPostOperationController(
  ds: DataSource,
  internalOk: boolean,
  params: {
    id: string;
    amount?: unknown;
    idempotencyKey?: string;
    type?: string;
    correlationId?: string;
    meta?: Record<string, unknown>;
  },
) {
  if (!internalOk) return { status: 401, body: { error: "unauthorized" } };

  const idempotencyKey = params.idempotencyKey?.trim();
  if (!idempotencyKey) {
    return {
      status: 400,
      body: { error: "idempotency_key_required" },
    };
  }

  const n =
    typeof params.amount === "string"
      ? parseFloat(params.amount)
      : typeof params.amount === "number"
        ? params.amount
        : NaN;
  if (!Number.isFinite(n) || n === 0) {
    return { status: 400, body: { error: "invalid_amount" } };
  }

  const existing = await accountsService.findOperationByIdempotency(
    ds,
    params.id,
    idempotencyKey,
  );
  if (existing) return { status: 200, body: existing };

  const result = await ds.manager.transaction(async (em) =>
    accountsService.postOperation(em, {
      accountId: params.id,
      amount: n,
      type: params.type ?? null,
      correlationId: params.correlationId ?? null,
      idempotencyKey,
      meta: params.meta ?? null,
    }),
  );

  if (result === null)
    return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400, body: { error: "insufficient_balance" } };
  return result.created
    ? { status: 201, body: result.op }
    : { status: 200, body: result.op };
}

export async function internalTransferFromMasterController(
  ds: DataSource,
  internalOk: boolean,
  params: {
    toAccountId: string;
    amount: number;
    idempotencyKey: string;
    type?: string;
    meta?: Record<string, unknown>;
  },
  authorization?: string,
) {
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };
  if (!authorization?.startsWith("Bearer "))
    return { status: 401 as const, body: { error: "authorization_required" } };
  const payload = await verifyBearerToken(authorization);
  if (!payload)
    return { status: 401 as const, body: { error: "unauthorized" } };

  let clientId = params.meta && typeof params.meta.clientId === "string"
    ? params.meta.clientId
    : null;
  if (!clientId) {
    const account = await accountsService.findAccountById(ds, params.toAccountId);
    clientId = account?.clientId ?? null;
  }
  if (!clientId || !canReadAccount(payload, clientId))
    return { status: 403 as const, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.transferFromMaster(em, {
      masterAccountId: env.masterAccountId,
      toAccountId: params.toAccountId,
      amount: params.amount,
      idempotencyKey: params.idempotencyKey,
      type: params.type ?? null,
      meta: params.meta ?? null,
    }),
  );

  if (result === null)
    return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400, body: { error: "insufficient_balance" } };
  if (result === "exchange_rate_unavailable")
    return { status: 503, body: { error: "exchange_rate_unavailable" } };
  return {
    status: 200,
    body: { ok: true },
    toAccountOperation: result.toAccountOperation,
  };
}

export async function internalTransferToMasterController(
  ds: DataSource,
  internalOk: boolean,
  params: {
    fromAccountId: string;
    amount: number;
    idempotencyKey: string;
    type?: string;
    meta?: Record<string, unknown>;
  },
  authorization?: string,
) {
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };
  if (!authorization?.startsWith("Bearer "))
    return { status: 401 as const, body: { error: "authorization_required" } };
  const payload = await verifyBearerToken(authorization);
  if (!payload)
    return { status: 401 as const, body: { error: "unauthorized" } };

  let clientId = params.meta && typeof params.meta.clientId === "string"
    ? params.meta.clientId
    : null;
  if (!clientId) {
    const account = await accountsService.findAccountById(ds, params.fromAccountId);
    clientId = account?.clientId ?? null;
  }
  if (!clientId || !canReadAccount(payload, clientId))
    return { status: 403 as const, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.transferToMaster(em, {
      masterAccountId: env.masterAccountId,
      fromAccountId: params.fromAccountId,
      amount: params.amount,
      idempotencyKey: params.idempotencyKey,
      type: params.type ?? null,
      meta: params.meta ?? null,
    }),
  );

  if (result === null)
    return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400, body: { error: "insufficient_balance" } };
  if (result === "exchange_rate_unavailable")
    return { status: 503, body: { error: "exchange_rate_unavailable" } };
  return {
    status: 200,
    body: { ok: true },
    fromAccountOperation: result.fromAccountOperation,
  };
}

export async function transferController(
  ds: DataSource,
  payload: JWTPayload,
  params: {
    fromAccountId?: string;
    toAccountId?: string;
    amount?: unknown;
    idempotencyKey?: string;
  },
) {
  const amount = accountsService.parseAmount(params.amount);
  if (amount == null) return { status: 400, body: { error: "invalid_amount" } };
  const fromAccountId = params.fromAccountId;
  const toAccountId = params.toAccountId;
  if (!fromAccountId || !toAccountId)
    return {
      status: 400,
      body: { error: "from_account_id_and_to_account_id_required" },
    };

  const fromAccount = await accountsService.findAccountById(ds, fromAccountId);
  if (!fromAccount)
    return { status: 404, body: { error: "from_account_not_found" } };
  if (!canReadAccount(payload, fromAccount.clientId))
    return { status: 403, body: { error: "forbidden" } };

  const toAccount = await accountsService.findAccountById(ds, toAccountId);
  if (!toAccount)
    return { status: 404, body: { error: "to_account_not_found" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.transferBetweenAccounts(em, {
      fromAccountId,
      toAccountId,
      amount,
      idempotencyKey: params.idempotencyKey ?? null,
    }),
  );

  if (result === "same_account")
    return { status: 400, body: { error: "same_account" } };
  if (result === null || result === "account_not_found")
    return { status: 404, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400, body: { error: "insufficient_balance" } };
  if (result === "exchange_rate_unavailable")
    return { status: 503, body: { error: "exchange_rate_unavailable" } };
  return {
    status: 200,
    body: { ok: true },
    fromOperation: result.fromOperation,
    toOperation: result.toOperation,
  };
}
