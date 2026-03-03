import { DataSource } from "typeorm";
import { JWTPayload } from "jose";
import { AccountStatus } from "../db/enums/AccountStatus";
import {
  canReadAccount,
  canManageAll,
  canCreateAccountFor,
  canCloseAccount,
} from "../security/access";
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
    return { status: 200 as const, body: items };
  }

  if (!payload.sub) return { status: 403 as const, body: { error: "forbidden" } };
  const items = await accountsService.findAccounts(ds, {
    clientId: payload.sub,
  });
  return { status: 200 as const, body: items };
}

export async function getAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const account = await accountsService.findAccountById(ds, params.id);
  if (!account)
    return { status: 404 as const, body: { error: "account_not_found" } };

  if (!canReadAccount(payload, account.clientId)) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }

  return { status: 200 as const, body: account };
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
  if (!account)
    return { status: 404 as const, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId)) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }

  const limit = Math.min(
    Math.max(1, params.limit ?? 20),
    100,
  );
  const offset = Math.max(0, params.offset ?? 0);
  const sort = params.sort === "asc" ? "ASC" : "DESC";

  const { items, total } = await accountsService.findOperations(ds, params.id, {
    limit,
    offset,
    sort,
  });

  return { status: 200 as const, body: { items, total } };
}

export async function createAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { clientId?: string },
) {
  if (!payload.sub) return { status: 403 as const, body: { error: "forbidden" } };

  const clientId = canManageAll(payload)
    ? (params.clientId ?? payload.sub)
    : payload.sub;
  if (!canCreateAccountFor(payload, clientId)) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }

  const account = await accountsService.createAccount(ds, clientId);
  return { status: 201 as const, body: account };
}

export async function closeAccountController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string },
) {
  const account = await accountsService.findAccountById(ds, params.id);
  if (!account)
    return { status: 404 as const, body: { error: "account_not_found" } };
  if (!canCloseAccount(payload, account.clientId)) {
    return { status: 403 as const, body: { error: "forbidden" } };
  }
  if (account.status === AccountStatus.Closed) {
    return { status: 400 as const, body: { error: "account_already_closed" } };
  }

  const closed = await accountsService.closeAccount(ds, account);
  return { status: 200 as const, body: closed };
}

export async function depositController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string; amount?: unknown },
) {
  const amount = accountsService.parseAmount(params.amount);
  if (amount == null)
    return { status: 400 as const, body: { error: "invalid_amount" } };

  const account = await accountsService.findAccountById(ds, params.id);
  if (!account)
    return { status: 404 as const, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId))
    return { status: 403 as const, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.deposit(em, params.id, amount),
  );

  if (result === "closed")
    return { status: 400 as const, body: { error: "account_closed" } };
  return { status: 200 as const, body: result };
}

export async function withdrawController(
  ds: DataSource,
  payload: JWTPayload,
  params: { id: string; amount?: unknown },
) {
  const amount = accountsService.parseAmount(params.amount);
  if (amount == null)
    return { status: 400 as const, body: { error: "invalid_amount" } };

  const account = await accountsService.findAccountById(ds, params.id);
  if (!account)
    return { status: 404 as const, body: { error: "account_not_found" } };
  if (!canReadAccount(payload, account.clientId))
    return { status: 403 as const, body: { error: "forbidden" } };

  const result = await ds.manager.transaction((em) =>
    accountsService.withdraw(em, params.id, amount),
  );

  if (result === "closed")
    return { status: 400 as const, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400 as const, body: { error: "insufficient_balance" } };
  return { status: 200 as const, body: result };
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
  if (!internalOk)
    return { status: 401 as const, body: { error: "unauthorized" } };

  const idempotencyKey = params.idempotencyKey?.trim();
  if (!idempotencyKey) {
    return { status: 400 as const, body: { error: "idempotency_key_required" } };
  }

  const n =
    typeof params.amount === "string"
      ? parseFloat(params.amount)
      : typeof params.amount === "number"
        ? params.amount
        : NaN;
  if (!Number.isFinite(n) || n === 0) {
    return { status: 400 as const, body: { error: "invalid_amount" } };
  }

  const existing = await accountsService.findOperationByIdempotency(
    ds,
    params.id,
    idempotencyKey,
  );
  if (existing) return { status: 200 as const, body: existing };

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
    return { status: 404 as const, body: { error: "account_not_found" } };
  if (result === "closed")
    return { status: 400 as const, body: { error: "account_closed" } };
  if (result === "insufficient_balance")
    return { status: 400 as const, body: { error: "insufficient_balance" } };
  return result.created
    ? { status: 201 as const, body: result.op }
    : { status: 200 as const, body: result.op };
}
