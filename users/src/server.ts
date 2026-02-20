import Fastify, { FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";

import { env } from "./env";
import { initDataSource } from "./db/data-source";
import { seedInitialUsers } from "./bootstrap/seed";
import { registerUsersRoutes } from "./routes/users";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  await app.register(formbody);

  const ds = await initDataSource();
  await ds.runMigrations();
  await seedInitialUsers(ds);

  app.decorate("db", ds);

  registerUsersRoutes(app);
  app.get("/health", async () => ({ ok: true }));

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Awaited<ReturnType<typeof initDataSource>>;
  }
}
