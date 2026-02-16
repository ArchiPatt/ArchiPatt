import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { env } from "../env";
import { User } from "./entities/User";
import { OAuthClient } from "./entities/OAuthClient";
import { Session } from "./entities/Session";
import { AuthorizationCode } from "./entities/AuthorizationCode";
import { RefreshToken } from "./entities/RefreshToken";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  entities: [User, OAuthClient, Session, AuthorizationCode, RefreshToken],
  migrations: [path.join(__dirname, "migrations/*.{ts,js}")],
  synchronize: false,
  logging: false
});

export async function initDataSource() {
  if (AppDataSource.isInitialized) return AppDataSource;
  await AppDataSource.initialize();
  return AppDataSource;
}

