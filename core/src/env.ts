import * as dotenv from "dotenv";

dotenv.config();

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Env ${name} must be a number`);
  return n;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: num("PORT", 4000),
  authIssuer: must("AUTH_ISSUER"),
  internalToken: must("INTERNAL_TOKEN"),
  authService: {
    baseUrl:
      process.env.AUTH_SERVICE_URL ??
      process.env.AUTH_ISSUER ??
      "http://localhost:4000",
    internalToken:
      process.env.AUTH_INTERNAL_TOKEN ??
      process.env.USERS_INTERNAL_TOKEN ??
      process.env.INTERNAL_TOKEN ??
      "",
  },
  usersService: {
    baseUrl: process.env.USERS_SERVICE_URL ?? "http://localhost:4001",
    internalToken:
      process.env.USERS_INTERNAL_TOKEN ??
      process.env.AUTH_INTERNAL_TOKEN ??
      process.env.INTERNAL_TOKEN ??
      "",
  },
  creditsService: {
    baseUrl: process.env.CREDITS_SERVICE_URL ?? "http://localhost:4002",
    internalToken:
      process.env.CREDITS_INTERNAL_TOKEN ?? process.env.INTERNAL_TOKEN ?? "",
  },
  masterAccountId:
    process.env.MASTER_ACCOUNT_ID ?? "00000000-0000-0000-0000-000000000001",
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? "amqp://localhost",
  },
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: num("DB_PORT", 5432),
    user: process.env.DB_USER ?? "core",
    password: process.env.DB_PASSWORD ?? "core",
    name: process.env.DB_NAME ?? "core",
  },
};
