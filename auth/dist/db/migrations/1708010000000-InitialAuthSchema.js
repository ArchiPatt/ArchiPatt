"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialAuthSchema1708010000000 = void 0;
class InitialAuthSchema1708010000000 {
    name = "InitialAuthSchema1708010000000";
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "username" text NOT NULL,
        "password_hash" text NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_username" ON "users" ("username")`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "oauth_clients" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "client_id" text NOT NULL,
        "client_secret_hash" text NULL,
        "redirect_uris" text[] NOT NULL,
        "allowed_scopes" text[] NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_oauth_clients_client_id" ON "oauth_clients" ("client_id")`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_sessions_user_id" ON "sessions" ("user_id")`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "authorization_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "code" text NOT NULL,
        "client_id" text NOT NULL,
        "user_id" uuid NOT NULL,
        "redirect_uri" text NOT NULL,
        "scopes" text[] NOT NULL,
        "code_challenge" text NOT NULL,
        "code_challenge_method" text NOT NULL,
        "nonce" text NULL,
        "expires_at" timestamptz NOT NULL,
        "consumed_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_authorization_codes_code" ON "authorization_codes" ("code")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_authorization_codes_client_id" ON "authorization_codes" ("client_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_authorization_codes_user_id" ON "authorization_codes" ("user_id")`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "token" text NOT NULL,
        "client_id" text NOT NULL,
        "username" text NOT NULL,
        "scopes" text[] NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "revoked_at" timestamptz NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_refresh_tokens_token" ON "refresh_tokens" ("token")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_client_id" ON "refresh_tokens" ("client_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_username" ON "refresh_tokens" ("username")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "authorization_codes"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "sessions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "oauth_clients"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
exports.InitialAuthSchema1708010000000 = InitialAuthSchema1708010000000;
