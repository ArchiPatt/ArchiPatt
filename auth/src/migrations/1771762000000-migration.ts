import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771762000000 implements MigrationInterface {
  name = "Migration1771762000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const usersTable = (await queryRunner.hasTable("users"))
      ? "users"
      : (await queryRunner.hasTable("user"))
        ? "user"
        : null;
    if (!usersTable) return;

    const hashColumn = usersTable === "users" ? "password_hash" : "passwordHash";

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

    await queryRunner.query(
      `DELETE FROM "${usersTable}" WHERE "username" IN ($1, $2, $3, $4)`,
      ["admin", "qa_employee", "qa_client", "qa_client2"]
    );
  }
}
