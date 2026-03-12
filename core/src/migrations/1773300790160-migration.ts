import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1773300790160 implements MigrationInterface {
  name = "Migration1773300790160";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "currency" text NOT NULL DEFAULT 'RUB'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "currency"`);
  }
}
