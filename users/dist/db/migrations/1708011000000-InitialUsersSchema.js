"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialUsersSchema1708011000000 = void 0;
class InitialUsersSchema1708011000000 {
    name = "InitialUsersSchema1708011000000";
    async up(queryRunner) {
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
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_profiles"`);
    }
}
exports.InitialUsersSchema1708011000000 = InitialUsersSchema1708011000000;
