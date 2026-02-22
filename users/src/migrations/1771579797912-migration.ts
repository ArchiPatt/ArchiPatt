import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771579797912 implements MigrationInterface {
  name = "Migration1771579797912";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "displayName" text, "roles" text array NOT NULL DEFAULT ARRAY[]::text[], "isBlocked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_622345c51168e12eba4225a021" ON "user_profile" ("username") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_622345c51168e12eba4225a021"`,
    );
    await queryRunner.query(`DROP TABLE "user_profile"`);
  }
}
