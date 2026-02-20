import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771572380148 implements MigrationInterface {
  name = "Migration1771572380148";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "display_name" text, "roles" text array NOT NULL DEFAULT ARRAY[]::text[], "is_blocked" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1ec6662219f4605723f1e41b6cb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7bdaa0714f4c1087a926a2d836" ON "user_profiles" ("username") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7bdaa0714f4c1087a926a2d836"`,
    );
    await queryRunner.query(`DROP TABLE "user_profiles"`);
  }
}
