import { JWTPayload } from "jose";
import { DataSource } from "typeorm";
import { fetchUsersInternal } from "../integrations/users-service";
import { fetchAllCredits } from "../integrations/credits-service";
import { canManageAll } from "../security/access";
import * as accountsService from "../services/accounts";

export async function clientsOverviewController(
  ds: DataSource,
  payload: JWTPayload,
  params: { limit?: number; offset?: number },
  authorization?: string,
) {
  if (!canManageAll(payload)) {
    return { status: 403, body: { error: "forbidden" } };
  }

  const pageLimit = Math.min(Math.max(1, params.limit ?? 20), 100);
  const pageOffset = Math.max(0, params.offset ?? 0);

  const { items: users, total } = await fetchUsersInternal(1000, 0, authorization);
  const clientIds = users.map((u) => u.id);
  if (clientIds.length === 0) {
    return { status: 200, body: { items: [], total: 0 } };
  }

  const [accounts, allCredits] = await Promise.all([
    accountsService.findAccountsByClientIds(ds, clientIds),
    fetchAllCredits(authorization),
  ]);

  const clientIdsSet = new Set(clientIds);
  const credits = allCredits.filter((cr) => clientIdsSet.has(cr.clientId));

  const accountsByClient = new Map<string, typeof accounts>();
  for (const acc of accounts) {
    const list = accountsByClient.get(acc.clientId) ?? [];
    list.push(acc);
    accountsByClient.set(acc.clientId, list);
  }

  const creditsByClient = new Map<string, typeof credits>();
  for (const cr of credits) {
    const list = creditsByClient.get(cr.clientId) ?? [];
    list.push(cr);
    creditsByClient.set(cr.clientId, list);
  }

  const now = Date.now();
  function calculateRating(clientCredits: typeof credits) {
    const overdueCount = clientCredits.filter(
      (c) =>
        c.status === "active" &&
        ((c.nextPaymentDueAt &&
          new Date(c.nextPaymentDueAt).getTime() <= now) ||
          c.overdueSince != null),
    ).length;
    const closedCount = clientCredits.filter(
      (c) => c.status === "closed",
    ).length;
    const score = Math.max(
      0,
      Math.min(100, 100 - overdueCount * 20 + closedCount * 3),
    );
    return {
      score: Math.round(score),
      overdueCount,
      totalCredits: clientCredits.length,
      closedCount,
    };
  }

  const beforeFilter = users.map((user) => {
    const userCredits = creditsByClient.get(user.id) ?? [];
    return {
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        roles: user.roles,
        isBlocked: user.isBlocked,
      },
      accounts: accountsByClient.get(user.id) ?? [],
      credits: userCredits,
      creditRating: calculateRating(userCredits),
    };
  });

  const filtered = beforeFilter.filter(
    (row) => row.accounts.length > 0 || row.credits.length > 0,
  );
  const items = filtered.slice(pageOffset, pageOffset + pageLimit);

  return {
    status: 200,
    body: { items, total: filtered.length },
  };
}
