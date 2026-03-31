import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { env } from "../env";
import { CreditTariff } from "../db/entities/CreditTariff";
import { Credit } from "../db/entities/Credit";
import { CreditPayment } from "../db/entities/CreditPayment";
import { IdempotencyLedger } from "../db/entities/IdempotencyLedger";

const AppDataSource = new DataSource({
  type: "postgres",
  host: env.db.host,
  port: env.db.port,
  username: env.db.user,
  password: env.db.password,
  database: env.db.name,
  entities: [CreditTariff, Credit, CreditPayment, IdempotencyLedger],
  migrations: [path.join(process.cwd(), "src/migrations/*.{ts,js}")],
  synchronize: false,
  logging: false,
});

export default AppDataSource;
