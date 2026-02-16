import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialUsersSchema1708011000000 implements MigrationInterface {
  name = "InitialUsersSchema1708011000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_profiles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" text NOT NULL,
        "display_name" text NULL,
        "roles" text[] NOT NULL DEFAULT ARRAY[]::text[],
        "is_blocked" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_user_profiles_username" ON "user_profiles" ("username")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
  }
}

