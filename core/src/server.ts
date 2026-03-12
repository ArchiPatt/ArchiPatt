import Fastify, { FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import fastifyWebsocket from "@fastify/websocket";
import path from "path";
import { env } from "./env";
import { initDataSource } from "./db/data-source";
import { registerDocsRoutes } from "./routes/docs";
import { registerAccountsRoutes } from "./routes/accounts";
import { registerDashboardRoutes } from "./routes/dashboard";
import { registerWsAccountsRoutes } from "./routes/ws-accounts";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  await app.register(fastifyWebsocket);
  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(formbody);
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), "node_modules", "swagger-ui-dist"),
    prefix: "/swagger-static/",
  });

  const ds = await initDataSource();
  app.decorate("db", ds);

  registerDocsRoutes(app);
  registerAccountsRoutes(app);
  registerDashboardRoutes(app);
  registerWsAccountsRoutes(app);
  app.get("/health", async () => ({ ok: true }));

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Awaited<ReturnType<typeof initDataSource>>;
  }
}
