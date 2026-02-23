import { env } from "../env";

type OperationKind = "credit" | "debit";

export async function postAccountOperation(input: {
  accountId: string;
  amount: number;
  kind: OperationKind;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
}) {
  if (!env.coreService.internalToken) {
    throw new Error("CORE_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured");
  }

  const url = `${env.coreService.baseUrl}/internal/accounts/${encodeURIComponent(input.accountId)}/operations`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.coreService.internalToken,
      "x-idempotency-key": input.idempotencyKey
    },
    body: JSON.stringify({
      kind: input.kind,
      amount: Number(input.amount.toFixed(2)),
      metadata: input.metadata ?? null
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core operation failed (${res.status}): ${text}`);
  }

  return await res.json().catch(() => null);
}
