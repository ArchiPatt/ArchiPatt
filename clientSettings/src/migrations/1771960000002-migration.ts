import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771960000002 implements MigrationInterface {
  name = "Migration1771960000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "hidden_account" (
        "id"        uuid  NOT NULL DEFAULT uuid_generate_v4(),
        "userId"    uuid  NOT NULL,
        "accountId" text  NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hidden_account"              PRIMARY KEY ("id"),
        CONSTRAINT "UQ_hidden_account_user_account" UNIQUE ("userId", "accountId")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_hidden_account_userId" ON "hidden_account" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_hidden_account_userId"`,
    );
    await queryRunner.query(`DROP TABLE "hidden_account"`);
  }
}
