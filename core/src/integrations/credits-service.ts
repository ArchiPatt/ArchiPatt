import { env } from "../env";
import {
  CIRCUIT_CREDITS_SERVICE,
  resilientFetch,
} from "../http/resilientFetch";
import { traceHeaders } from "../trace/traceContext";

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
    ...traceHeaders(),
  };
  if (authorization) headers["authorization"] = authorization;
  const res = await resilientFetch(CIRCUIT_CREDITS_SERVICE, url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`credits service error (${res.status}): ${text}`);
  }

  return (await res.json()) as CreditItem[];
}
