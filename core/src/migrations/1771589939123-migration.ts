import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771589939123 implements MigrationInterface {
  name = "Migration1771589939123";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_account_operation_idempotency"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_account_operation_idempotency" ON "account_operation" ("accountId", "idempotencyKey") WHERE ("idempotencyKey" IS NOT NULL)`,
    );
  }
}
