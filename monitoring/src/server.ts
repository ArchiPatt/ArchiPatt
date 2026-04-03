import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { env } from "./env";
import { initStore, closeStore } from "./services/events";
import { registerMonitoringRoutes } from "./routes/monitoring";
import { registerDocsRoutes } from "./routes/docs";

export async function buildApp(): Promise<FastifyInstance> {
  await initStore();

  const app = Fastify({
    logger: {
      level: env.nodeEnv === "development" ? "info" : "info",
    },
  });

  app.addHook("onClose", async () => {
    await closeStore();
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-trace-id"],
    methods: ["GET", "POST", "OPTIONS"],
  });

  registerMonitoringRoutes(app);
  registerDocsRoutes(app);

  return app;
}
