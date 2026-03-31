import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1774949036489 implements MigrationInterface {
  name = "Migration1774949036489";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "idempotency_ledger" ("key" character varying(255) NOT NULL, "scope" character varying(128) NOT NULL, "statusCode" integer NOT NULL, "body" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c0372baadc5ec2e26415d502fee" PRIMARY KEY ("key"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "idempotency_ledger"`);
  }
}
