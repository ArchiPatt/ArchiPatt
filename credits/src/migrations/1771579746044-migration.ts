import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771579746044 implements MigrationInterface {
  name = "Migration1771579746044";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "credit_tariff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" text NOT NULL, "interestRate" numeric(10,4) NOT NULL, "billingPeriodDays" integer NOT NULL DEFAULT '1', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9256ae07ae1139bf0f684f24970" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee8daa3dcb3d4d9dd2423490af" ON "credit_tariff" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "credit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "clientId" uuid NOT NULL, "accountId" uuid NOT NULL, "tariffId" uuid NOT NULL, "principalAmount" numeric(18,2) NOT NULL, "outstandingAmount" numeric(18,2) NOT NULL, "status" text NOT NULL DEFAULT 'active', "issuedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "nextPaymentDueAt" TIMESTAMP WITH TIME ZONE NOT NULL, "closedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c98add8e192ded18b69c3e345a5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d0589e09c0457e80caca7bdaad" ON "credit" ("clientId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "credit_payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "creditId" uuid NOT NULL, "amount" numeric(18,2) NOT NULL, "paymentType" text NOT NULL, "performedBy" text NOT NULL, "performedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7bd33ab099bbf611729ac7a563d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a84b2d4bfc23cd895730776abc" ON "credit_payment" ("creditId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a84b2d4bfc23cd895730776abc"`,
    );
    await queryRunner.query(`DROP TABLE "credit_payment"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d0589e09c0457e80caca7bdaad"`,
    );
    await queryRunner.query(`DROP TABLE "credit"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee8daa3dcb3d4d9dd2423490af"`,
    );
    await queryRunner.query(`DROP TABLE "credit_tariff"`);
  }
}
