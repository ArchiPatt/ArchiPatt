import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771960000001 implements MigrationInterface {
  name = "Migration1771960000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TABLE "user_color_scheme" (
        "userId"      uuid  NOT NULL,
        "colorScheme" text  NOT NULL DEFAULT 'auto',
        "updatedAt"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_color_scheme" PRIMARY KEY ("userId")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_color_scheme"`);
  }
}
