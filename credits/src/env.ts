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
  port: num("PORT", 4002),
  authIssuer: must("AUTH_ISSUER"),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: num("DB_PORT", 5432),
    user: process.env.DB_USER ?? "postgres",
    password: process.env.DB_PASSWORD ?? "1234",
    name: process.env.DB_NAME ?? "credits"
  }
};
