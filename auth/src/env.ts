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
  serverType: (process.env.SERVER_TYPE ?? "DEV").toUpperCase(),
  port: num("PORT", 4000),
  issuer: process.env.ISSUER ?? `http://localhost:${num("PORT", 4000)}`,

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: num("DB_PORT", 5432),
    user: process.env.DB_USER ?? "auth",
    password: process.env.DB_PASSWORD ?? "auth",
    name: process.env.DB_NAME ?? "auth",
  },

  tokens: {
    accessTtlSeconds: num("ACCESS_TOKEN_TTL_SECONDS", 15 * 60),
    idTtlSeconds: num("ID_TOKEN_TTL_SECONDS", 15 * 60),
    refreshTtlSeconds: num("REFRESH_TOKEN_TTL_SECONDS", 60 * 60 * 24 * 30),
  },

  session: {
    ttlSeconds: num("SESSION_TTL_SECONDS", 60 * 60 * 24 * 7),
    cookieName: process.env.SESSION_COOKIE_NAME ?? "auth_session",
    cookieSecret:
      process.env.SESSION_COOKIE_SECRET ??
      process.env.AUTH_INTERNAL_TOKEN ??
      "auth-session-secret-change-in-production",
  },

  keys: {
    privateJwkJson: must("AUTH_PRIVATE_JWK_JSON"),
  },

  usersService: {
    baseUrl: must("USERS_SERVICE_URL"),
    internalToken: must("USERS_INTERNAL_TOKEN"),
  },
  internalToken: process.env.AUTH_INTERNAL_TOKEN ?? process.env.INTERNAL_TOKEN ?? process.env.USERS_INTERNAL_TOKEN ?? "",
};
