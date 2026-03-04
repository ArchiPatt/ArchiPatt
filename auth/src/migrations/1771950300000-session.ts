import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771950300000 implements MigrationInterface {
  name = "Migration1771950300000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "session" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sessionId" text NOT NULL,
        "userId" uuid NOT NULL,
        "username" text NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_session" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_session_sessionId" ON "session" ("sessionId")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_session_userId" ON "session" ("userId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_session_userId"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_session_sessionId"`);
    await queryRunner.query(`DROP TABLE "session"`);
  }
}
