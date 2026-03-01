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
    throw new Error(
      "CORE_INTERNAL_TOKEN (or INTERNAL_TOKEN) is not configured",
    );
  }

  const amountValue = Number(input.amount.toFixed(2));
  const amount =
    input.kind === "debit" ? -amountValue : amountValue;

  const url = `${env.coreService.baseUrl}/internal/accounts/${encodeURIComponent(input.accountId)}/operations`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-internal-token": env.coreService.internalToken,
    },
    body: JSON.stringify({
      idempotencyKey: input.idempotencyKey,
      amount,
      type: input.kind,
      meta: input.metadata ?? null,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`core operation failed (${res.status}): ${text}`);
  }

  return await res.json().catch(() => null);
}
