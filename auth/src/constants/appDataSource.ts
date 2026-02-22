import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { env } from "../env";
import { User } from "../db/entities/User";
import { AuthorizationCode } from "../db/entities/AuthorizationCode";
import { RefreshToken } from "../db/entities/RefreshToken";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  entities: [User, AuthorizationCode, RefreshToken],
  migrations: [path.join(process.cwd(), "src/migrations/*.{ts,js}")],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
