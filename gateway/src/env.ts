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
  port: num("PORT", 4004),
  authServiceUrl: process.env.AUTH_SERVICE_URL ?? "http://localhost:4000",
  usersServiceUrl: process.env.USERS_SERVICE_URL ?? "http://localhost:4001",
  creditsServiceUrl: process.env.CREDITS_SERVICE_URL ?? "http://localhost:4002",
  coreServiceUrl: process.env.CORE_SERVICE_URL ?? "http://localhost:4003",
  adminSettingServiceUrl: process.env.ADMIN_SETTING_SERVICE_URL ?? "http://localhost:4005",
  clientSettingsServiceUrl:
    process.env.CLIENT_SETTINGS_SERVICE_URL ?? "http://localhost:4006",
  /** Если пусто — события в monitoring не отправляются */
  monitoringServiceUrl: (process.env.MONITORING_SERVICE_URL ?? "").trim(),
};
