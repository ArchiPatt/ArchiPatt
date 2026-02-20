import * as dotenv from "dotenv";

dotenv.config();

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
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: num("DB_PORT", 5432),
    user: process.env.DB_USER ?? "core",
    password: process.env.DB_PASSWORD ?? "core",
    name: process.env.DB_NAME ?? "core",
  },
};
