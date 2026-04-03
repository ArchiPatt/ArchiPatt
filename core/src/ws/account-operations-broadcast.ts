import type { AccountOperation } from "../db/entities/AccountOperation";

export interface OperationPayload {
  id: string;
  accountId: string;
  amount: string;
  type: string | null;
  correlationId: string | null;
  idempotencyKey: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

export function operationToPayload(op: AccountOperation): OperationPayload {
  return {
    id: op.id,
    accountId: op.accountId,
    amount: op.amount,
    type: op.type,
    correlationId: op.correlationId,
    idempotencyKey: op.idempotencyKey,
    meta: op.meta,
    createdAt:
      op.createdAt instanceof Date
        ? op.createdAt.toISOString()
        : String(op.createdAt),
  };
}

const subscribers = new Map<string, Set<(data: string) => void>>();

/**
 * Подписка сотрудников на операции по всем счетам (firehose)
 */
const globalSubscribers = new Set<(data: string) => void>();

export function subscribeGlobal(send: (data: string) => void): () => void {
  globalSubscribers.add(send);
  return () => {
    globalSubscribers.delete(send);
  };
}

export function subscribe(
  accountId: string,
  send: (data: string) => void,
): () => void {
  let set = subscribers.get(accountId);
  if (!set) {
    set = new Set();
    subscribers.set(accountId, set);
  }
  set.add(send);

  return () => {
    const s = subscribers.get(accountId);
    if (s) {
      s.delete(send);
      if (s.size === 0) subscribers.delete(accountId);
    }
  };
}

export function notifyNewOperation(
  accountId: string,
  operation: AccountOperation,
): void {
  const set = subscribers.get(accountId);
  if (!set || set.size === 0) return;

  const payload: { type: "operation_added"; operation: OperationPayload } = {
    type: "operation_added",
    operation: operationToPayload(operation),
  };
  const data = JSON.stringify(payload);

  for (const send of set) {
    try {
      send(data);
    } catch {}
  }

  if (globalSubscribers.size > 0) {
    for (const send of globalSubscribers) {
      try {
        send(data);
      } catch {}
    }
  }
}

export function getSubscriberCount(accountId: string): number {
  return subscribers.get(accountId)?.size ?? 0;
}
