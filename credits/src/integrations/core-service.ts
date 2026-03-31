import { env } from "../env";
import { CIRCUIT_CORE_SERVICE, resilientFetch } from "../http/resilientFetch";
import { traceHeaders } from "../trace/traceContext";

type OperationKind = "credit" | "debit";

export async function postAccountOperation(input: {
  accountId: string;
  amount: number;
  kind: OperationKind;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}) {
  if (!env.coreService.internalToken) {
    throw new Error(
      "CORE_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured",
    );
  }

  const amountValue = Number(input.amount.toFixed(2));
  const amount = input.kind === "debit" ? -amountValue : amountValue;

  const operationType =
    input.kind === "credit" ? "credit_issue" : "credit_repayment";

  const url = `${env.coreService.baseUrl}/internal/accounts/${encodeURIComponent(input.accountId)}/operations`;
  const res = await resilientFetch(CIRCUIT_CORE_SERVICE, url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.coreService.internalToken,
      ...traceHeaders(),
    },
    body: JSON.stringify({
      idempotencyKey: input.idempotencyKey,
      amount,
      type: operationType,
      meta: input.metadata ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core operation failed (${res.status}): ${text}`);
  }

  return await res.json().catch(() => null);
}

export async function transferFromMaster(input: {
  toAccountId: string;
  amount: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  authorization?: string;
}) {
  if (!env.coreService.internalToken) {
    throw new Error(
      "CORE_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured",
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-internal-token": env.coreService.internalToken,
    ...traceHeaders(),
  };
  if (input.authorization) headers["authorization"] = input.authorization;

  const url = `${env.coreService.baseUrl}/internal/transfers/from-master`;
  const res = await resilientFetch(CIRCUIT_CORE_SERVICE, url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      toAccountId: input.toAccountId,
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      meta: input.metadata ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core transfer failed (${res.status}): ${text}`);
  }

  return await res.json().catch(() => null);
}

export async function transferToMaster(input: {
  fromAccountId: string;
  amount: number;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  authorization?: string;
}) {
  if (!env.coreService.internalToken) {
    throw new Error(
      "CORE_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured",
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-internal-token": env.coreService.internalToken,
    ...traceHeaders(),
  };
  if (input.authorization) headers["authorization"] = input.authorization;

  const url = `${env.coreService.baseUrl}/internal/transfers/to-master`;
  const res = await resilientFetch(CIRCUIT_CORE_SERVICE, url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      fromAccountId: input.fromAccountId,
      amount: input.amount,
      idempotencyKey: input.idempotencyKey,
      meta: input.metadata ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core transfer failed (${res.status}): ${text}`);
  }

  return await res.json().catch(() => null);
}
