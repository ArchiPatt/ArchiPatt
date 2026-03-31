import Fastify, { FastifyInstance } from "fastify";
import formbody from "@fastify/formbody";
import fastifyStatic from "@fastify/static";
import cors from "@fastify/cors";
import path from "path";
import { env } from "./env";
import { initDataSource } from "./db/data-source";
import { registerCreditsRoutes } from "./routes/credits";
import { registerDocsRoutes } from "./routes/docs";
import { registerSimulatedInstability } from "./plugins/simulatedInstability";
import { registerServiceMonitoring } from "./plugins/serviceMonitoring";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  registerSimulatedInstability(app);

  registerServiceMonitoring(app, {
    monitoringServiceUrl: env.monitoringServiceUrl,
    source: "credits",
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-trace-id"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });
  await app.register(formbody);
  await app.register(fastifyStatic, {
    root: path.join(process.cwd(), "node_modules", "swagger-ui-dist"),
    prefix: "/swagger-static/",
  });

  const ds = await initDataSource();
  await ds.runMigrations();
  app.decorate("db", ds);

  registerDocsRoutes(app);
  registerCreditsRoutes(app);
  app.get("/health", async () => ({ ok: true }));

  return app;
}

declare module "fastify" {
  interface FastifyInstance {
    db: Awaited<ReturnType<typeof initDataSource>>;
  }
}
