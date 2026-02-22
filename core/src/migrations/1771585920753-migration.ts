import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771585920753 implements MigrationInterface {
  name = "Migration1771585920753";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "account" ADD "status" text NOT NULL DEFAULT 'open'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "account" DROP COLUMN "status"`);
  }
}
