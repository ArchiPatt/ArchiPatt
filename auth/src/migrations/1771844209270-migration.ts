import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771844209270 implements MigrationInterface {
    name = 'Migration1771844209270'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "password_hash" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username") `);
        await queryRunner.query(`CREATE TABLE "authorization_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "clientId" text NOT NULL, "userId" uuid NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "consumedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_586233caf7e281dc24aaedd1335" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1a83c8414bc822e77b0a0c161b" ON "authorization_code" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_ffbeadc85eea5dabbbcaf4f6b0" ON "authorization_code" ("clientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c84c3d4d0e6344f36785f679e4" ON "authorization_code" ("userId") `);
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "clientId" text NOT NULL, "username" text NOT NULL, "scopes" text array NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "revokedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c31d0a2f38e6e99110df62ab0a" ON "refresh_token" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_f6f07caa0ec6df39d56b0aa9f6" ON "refresh_token" ("clientId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdf0cae2ed6183bc794e391981" ON "refresh_token" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_fdf0cae2ed6183bc794e391981"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f6f07caa0ec6df39d56b0aa9f6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c31d0a2f38e6e99110df62ab0a"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c84c3d4d0e6344f36785f679e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffbeadc85eea5dabbbcaf4f6b0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1a83c8414bc822e77b0a0c161b"`);
        await queryRunner.query(`DROP TABLE "authorization_code"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
