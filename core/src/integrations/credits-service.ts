import { env } from "../env";

export type CreditItem = {
  id: string;
  clientId: string;
  accountId: string;
  tariffId: string;
  principalAmount: string;
  outstandingAmount: string;
  status: string;
  issuedAt: string;
  nextPaymentDueAt: string | null;
  closedAt: string | null;
};

export async function fetchCreditsByClientIds(
  clientIds: string[],
): Promise<CreditItem[]> {
  if (clientIds.length === 0) return [];

  const url = `${env.creditsService.baseUrl}/internal/credits/by-clients?clientIds=${clientIds.join(",")}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "x-internal-token": env.creditsService.internalToken,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`credits service error (${res.status}): ${text}`);
  }

  return (await res.json()) as CreditItem[];
}
