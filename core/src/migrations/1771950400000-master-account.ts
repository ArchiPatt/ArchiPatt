import { MigrationInterface, QueryRunner } from "typeorm";

const MASTER_CLIENT_ID = "00000000-0000-0000-0000-000000000000";
const MASTER_ACCOUNT_ID = "00000000-0000-0000-0000-000000000001";
const INITIAL_BALANCE = "1000000000.00";

export class Migration1771950400000 implements MigrationInterface {
  name = "Migration1771950400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasAccount = await queryRunner.hasTable("account");
    if (!hasAccount) return;

    const exists = await queryRunner.query(
      `SELECT 1 FROM "account" WHERE "id" = $1`,
      [MASTER_ACCOUNT_ID],
    );
    if (exists?.length > 0) return;

    await queryRunner.query(
      `INSERT INTO "account" ("id", "clientId", "balance", "status", "createdAt")
       VALUES ($1, $2, $3, 'open', NOW())`,
      [MASTER_ACCOUNT_ID, MASTER_CLIENT_ID, INITIAL_BALANCE],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "account" WHERE "id" = $1`,
      ["00000000-0000-0000-0000-000000000001"],
    );
  }
}
