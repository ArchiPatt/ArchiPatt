import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { env } from "../env";
import { UserProfile } from "../db/entities/UserProfile";
import { IdempotencyLedger } from "../db/entities/IdempotencyLedger";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  entities: [UserProfile, IdempotencyLedger],
  migrations: [path.join(process.cwd(), "src/migrations/*.{ts,js}")],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
