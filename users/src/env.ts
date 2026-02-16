import * as dotenv from "dotenv";

dotenv.config();

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Env ${name} must be a number`);
  return n;
}

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function list(name: string, fallback: string[] = []): string[] {
  const v = process.env[name];
  if (!v) return fallback;
  return v
    .split(/[,\s]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: num("PORT", 4001),

  auth: {
    issuer: must("AUTH_ISSUER")
  },

  internalToken: must("INTERNAL_TOKEN"),

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: num("DB_PORT", 5432),
    user: process.env.DB_USER ?? "users",
    password: process.env.DB_PASSWORD ?? "users",
    name: process.env.DB_NAME ?? "users"
  },

  seed: {
    adminUsername: process.env.SEED_ADMIN_USERNAME ?? "admin",
    adminRoles: list("SEED_ADMIN_ROLES", ["admin", "employee", "client"]),
    clientUsername: process.env.SEED_CLIENT_USERNAME ?? "client1",
    clientRoles: list("SEED_CLIENT_ROLES", ["client"])
  }
};

