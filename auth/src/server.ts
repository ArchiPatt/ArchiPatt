import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import formbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import path from "path";

import { env } from "./env";
import { initDataSource } from "./db/data-source";
import { registerAuthRoutes } from "./routes/auth";
import { registerDocsRoutes } from "./routes/docs";
import { seedInitialData } from "./bootstrap/seed";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info"
    }
  });

  await app.register(cookie, {
    hook: "onRequest"
  });
  await app.register(formbody);
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), "node_modules", "swagger-ui-dist"),
    prefix: "/swagger-static/"
  });

  const ds = await initDataSource();
  await ds.runMigrations();
  await seedInitialData(ds);

  app.decorate("db", ds);

  registerDocsRoutes(app);
  registerAuthRoutes(app);

  app.get("/health", async () => ({ ok: true }));

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Awaited<ReturnType<typeof initDataSource>>;
  }
}

