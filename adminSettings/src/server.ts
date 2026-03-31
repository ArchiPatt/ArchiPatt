import Fastify, { FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import path from "path";
import { env } from "./env";
import { initDataSource } from "./db/data-source";
import { registerDocsRoutes } from "./routes/docs";
import { registerSettingsRoutes } from "./routes/settings";
import { registerServiceMonitoring } from "./plugins/serviceMonitoring";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  registerServiceMonitoring(app, {
    monitoringServiceUrl: env.monitoringServiceUrl,
    source: "admin-settings",
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-trace-id",
      "Idempotency-Key",
    ],
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
  registerSettingsRoutes(app);
  app.get("/health", async () => ({ ok: true }));

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Awaited<ReturnType<typeof initDataSource>>;
  }
}
