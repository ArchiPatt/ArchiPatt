import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771572600981 implements MigrationInterface {
    name = 'Migration1771572600981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" text NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe0bb3f6520ee0469504521e71" ON "users" ("username") `);
        await queryRunner.query(`CREATE TABLE "oauth_clients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "client_id" text NOT NULL, "client_secret_hash" text, "redirect_uris" text array NOT NULL, "allowed_scopes" text array NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c4759172d3431bae6f04e678e0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c5c4af500cc8bfc05500fff7f9" ON "oauth_clients" ("client_id") `);
        await queryRunner.query(`CREATE TABLE "sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_085d540d9f418cfbdc7bd55bb1" ON "sessions" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "authorization_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" text NOT NULL, "client_id" text NOT NULL, "user_id" uuid NOT NULL, "redirect_uri" text NOT NULL, "scopes" text array NOT NULL, "code_challenge" text NOT NULL, "code_challenge_method" text NOT NULL, "nonce" text, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "consumed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f05b2eb99ad2db12d87544656c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0dbddae21cb087717e5207a5bd" ON "authorization_codes" ("code") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b6780f6c2ce73987f7cabb4ae" ON "authorization_codes" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_68f8ccfda6bb17fb159cc965cc" ON "authorization_codes" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" text NOT NULL, "client_id" text NOT NULL, "username" text NOT NULL, "scopes" text array NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_4542dd2f38a61354a040ba9fd5" ON "refresh_tokens" ("token") `);
        await queryRunner.query(`CREATE INDEX "IDX_795771f59bffe508b60827b01e" ON "refresh_tokens" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_45486a72fd087415a321441ff6" ON "refresh_tokens" ("username") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_45486a72fd087415a321441ff6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_795771f59bffe508b60827b01e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4542dd2f38a61354a040ba9fd5"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_68f8ccfda6bb17fb159cc965cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b6780f6c2ce73987f7cabb4ae"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dbddae21cb087717e5207a5bd"`);
        await queryRunner.query(`DROP TABLE "authorization_codes"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_085d540d9f418cfbdc7bd55bb1"`);
        await queryRunner.query(`DROP TABLE "sessions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c5c4af500cc8bfc05500fff7f9"`);
        await queryRunner.query(`DROP TABLE "oauth_clients"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe0bb3f6520ee0469504521e71"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
