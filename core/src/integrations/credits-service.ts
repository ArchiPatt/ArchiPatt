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
  overdueSince: string | null;
  closedAt: string | null;
};

export async function fetchAllCredits(
  authorization?: string,
): Promise<CreditItem[]> {
  const url = `${env.creditsService.baseUrl}/internal/credits/by-clients`;
  const headers: Record<string, string> = {
    "x-internal-token": env.creditsService.internalToken,
  };
  if (authorization) headers["authorization"] = authorization;
  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`credits service error (${res.status}): ${text}`);
  }

  return (await res.json()) as CreditItem[];
}
