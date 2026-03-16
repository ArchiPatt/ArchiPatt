import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771950600000 implements MigrationInterface {
  name = "Migration1771950600000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("credit"))
        ? "credit"
        : null;
    if (!creditTable) return;

    await queryRunner.query(
      `ALTER TABLE "${creditTable}" ADD COLUMN IF NOT EXISTS "overdueSince" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("credit"))
        ? "credit"
        : null;
    if (!creditTable) return;

    await queryRunner.query(
      `ALTER TABLE "${creditTable}" DROP COLUMN IF EXISTS "overdueSince"`,
    );
  }
}
