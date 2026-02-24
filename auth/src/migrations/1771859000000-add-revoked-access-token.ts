import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRevokedAccessToken1771859000000 implements MigrationInterface {
  name = "AddRevokedAccessToken1771859000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "revoked_access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "jti" text NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9736b64576559ff2ca26fd05266" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_9f1954c5d180450ec40c5f2f53" ON "revoked_access_token" ("jti")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_9f1954c5d180450ec40c5f2f53"`);
    await queryRunner.query(`DROP TABLE "revoked_access_token"`);
  }
}
