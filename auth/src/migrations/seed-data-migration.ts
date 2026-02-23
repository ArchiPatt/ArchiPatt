import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDataMigration1971769000000 implements MigrationInterface {
  name = "SeedDataMigration1971769000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersTable = (await queryRunner.hasTable("users"))
      ? "users"
      : (await queryRunner.hasTable("user"))
        ? "user"
        : null;
    if (!usersTable) return;
    const authCodesTable = (await queryRunner.hasTable("authorization_code"))
      ? "authorization_code"
      : null;
    if (!authCodesTable) return;

    const table = await queryRunner.getTable(usersTable);
    if (!table) return;
    const columns = table.columns.map((c) => c.name);
    const hashColumn = columns.includes("password_hash")
      ? "password_hash"
      : columns.includes("passwordHash")
        ? "passwordHash"
        : null;
    if (!hashColumn) return;

    await queryRunner.query(
      `INSERT INTO "${usersTable}" ("id", "username", "${hashColumn}")
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM "${usersTable}" WHERE "username" = $2)`,
      [
        "99999999-9999-4999-8999-999999999999",
        "admin",
        "$2b$10$.6cis2u6m/PUkKVGRkuz9.PPUIOLWe7Pk.//1/EP0PfbB2/70l8wS"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${usersTable}" ("id", "username", "${hashColumn}")
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM "${usersTable}" WHERE "username" = $2)`,
      [
        "77777777-7777-4777-8777-777777777777",
        "qa_employee",
        "$2b$10$XiFJA.yVeOiV8v79eHq58uSWtSWQWWnIRehwHULBpDkIvgdX/Li3G"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${usersTable}" ("id", "username", "${hashColumn}")
       SELECT $1, $2, NULL
       WHERE NOT EXISTS (SELECT 1 FROM "${usersTable}" WHERE "username" = $2)`,
      [
        "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        "qa_no_password"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${authCodesTable}" ("id", "code", "clientId", "userId", "expiresAt", "consumedAt")
       SELECT $1, $2, $3, $4, NOW() + INTERVAL '7 days', NULL
       WHERE NOT EXISTS (SELECT 1 FROM "${authCodesTable}" WHERE "code" = $2)`,
      [
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        "setup-token-qa-no-password",
        "password-setup",
        "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${usersTable}" ("id", "username", "${hashColumn}")
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM "${usersTable}" WHERE "username" = $2)`,
      [
        "88888888-8888-4888-8888-888888888888",
        "qa_client",
        "$2b$10$XiFJA.yVeOiV8v79eHq58uSWtSWQWWnIRehwHULBpDkIvgdX/Li3G"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${usersTable}" ("id", "username", "${hashColumn}")
       SELECT $1, $2, $3
       WHERE NOT EXISTS (SELECT 1 FROM "${usersTable}" WHERE "username" = $2)`,
      [
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "qa_client2",
        "$2b$10$XiFJA.yVeOiV8v79eHq58uSWtSWQWWnIRehwHULBpDkIvgdX/Li3G"
      ]
    );

    await queryRunner.query(
      `UPDATE "${usersTable}"
       SET "${hashColumn}" = $1
       WHERE "username" = $2 AND "${hashColumn}" IS NULL`,
      [
        "$2b$10$XiFJA.yVeOiV8v79eHq58uSWtSWQWWnIRehwHULBpDkIvgdX/Li3G",
        "qa_client"
      ]
    );

    await queryRunner.query(
      `UPDATE "${usersTable}"
       SET "${hashColumn}" = $1
       WHERE "username" = $2 AND "${hashColumn}" IS NULL`,
      [
        "$2b$10$XiFJA.yVeOiV8v79eHq58uSWtSWQWWnIRehwHULBpDkIvgdX/Li3G",
        "qa_client2"
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const usersTable = (await queryRunner.hasTable("users"))
      ? "users"
      : (await queryRunner.hasTable("user"))
        ? "user"
        : null;
    if (!usersTable) return;
    const authCodesTable = (await queryRunner.hasTable("authorization_code"))
      ? "authorization_code"
      : null;

    if (authCodesTable) {
      await queryRunner.query(
        `DELETE FROM "${authCodesTable}" WHERE "code" = $1`,
        ["setup-token-qa-no-password"]
      );
    }
    await queryRunner.query(
      `DELETE FROM "${usersTable}" WHERE "username" IN ($1, $2, $3, $4, $5)`,
      ["admin", "qa_employee", "qa_client", "qa_client2", "qa_no_password"]
    );
  }
}
