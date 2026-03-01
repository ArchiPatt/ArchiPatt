import { FastifyInstance } from "fastify";
import { In } from "typeorm";
import { Account } from "../db/entities/Account";
import { verifyBearerToken } from "../security/jwt";
import { fetchUserProfileByUsername } from "../integrations/users-service";
import { fetchUsersInternal } from "../integrations/users-service";
import { fetchCreditsByClientIds } from "../integrations/credits-service";
import { canManageAll } from "../security/access";

async function authPayloadOrNull(req: { headers: { authorization?: string } }) {
  try {
    const payload = await verifyBearerToken(req.headers.authorization);
    const username =
      typeof payload?.username === "string" ? payload.username : null;
    if (!payload?.sub || !username) {
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    }

    const profile = await fetchUserProfileByUsername(username);
    if (!profile)
      return { ok: false as const, code: 401 as const, error: "unauthorized" };
    if (profile.isBlocked)
      return { ok: false as const, code: 403 as const, error: "blocked_user" };

    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, code: 401 as const, error: "unauthorized" };
  }
}

export function registerDashboardRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { limit?: string; offset?: string };
  }>("/dashboard/clients-overview", async (req, reply) => {
    const auth = await authPayloadOrNull(req);
    if (!auth.ok) return reply.code(auth.code).send({ error: auth.error });
    if (!canManageAll(auth.payload)) {
      return reply.code(403).send({ error: "forbidden" });
    }

    try {
      const limit = Math.min(
        Math.max(1, parseInt(req.query?.limit ?? "20", 10) || 20),
        100,
      );
      const offset = Math.max(0, parseInt(req.query?.offset ?? "0", 10) || 0);

      const { items: users, total } = await fetchUsersInternal(limit, offset);
      const clientIds = users.map((u) => u.id);
      if (clientIds.length === 0) {
        return reply.send({ items: [], total });
      }

      const [accounts, credits] = await Promise.all([
        app.db.getRepository(Account).find({
          where: { clientId: In(clientIds) },
          order: { createdAt: "DESC" },
        }),
        fetchCreditsByClientIds(clientIds),
      ]);

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

      const items = users.map((user) => ({
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          roles: user.roles,
          isBlocked: user.isBlocked,
        },
        accounts: accountsByClient.get(user.id) ?? [],
        credits: creditsByClient.get(user.id) ?? [],
      }));

      return reply.send({ items, total });
    } catch (err) {
      app.log.error(err, "dashboard/clients-overview failed");
      return reply.code(200).send({ items: [], total: 0 });
    }
  });
}
