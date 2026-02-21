import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771650279315 implements MigrationInterface {
    name = 'Migration1771650279315'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientId" uuid NOT NULL, "balance" numeric(18,2) NOT NULL DEFAULT '0', "status" text NOT NULL DEFAULT 'open', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_861667d82d42bf6617f423f537" ON "account" ("clientId") `);
        await queryRunner.query(`CREATE TABLE "account_operation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accountId" uuid NOT NULL, "amount" numeric(18,2) NOT NULL, "type" text, "correlationId" uuid, "idempotencyKey" text, "meta" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4d984be82eaa17c4d0f822bb174" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3abb8bb4d28927fc096896bc4d" ON "account_operation" ("accountId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_3abb8bb4d28927fc096896bc4d"`);
        await queryRunner.query(`DROP TABLE "account_operation"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_861667d82d42bf6617f423f537"`);
        await queryRunner.query(`DROP TABLE "account"`);
    }

}
