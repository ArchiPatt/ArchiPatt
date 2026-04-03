import * as dotenv from "dotenv";
import path from "node:path";

dotenv.config();

function num(name: string, fallback: number): number {
  const v = process.env[name];
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isFinite(n)) throw new Error(`Env ${name} must be a number`);
  return n;
}

const dbPath =
  (process.env.MONITORING_DB_PATH ?? "").trim() ||
  path.join(process.cwd(), "data", "monitoring.sqlite");

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: num("PORT", 4010),
  sqlitePath: dbPath,
  maxStoredEvents: num("MONITORING_MAX_EVENTS", 100_000),
};
