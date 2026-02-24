import { MigrationInterface, QueryRunner } from "typeorm";

function pickColumnName(existing: string[], candidates: string[]): string {
  for (const c of candidates) {
    if (existing.includes(c)) return c;
  }
  return candidates[0];
}

export class Migration1771950500836 implements MigrationInterface {
  name = "Migration1771950500836";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = (await queryRunner.hasTable("user_profiles"))
      ? "user_profiles"
      : (await queryRunner.hasTable("user_profile"))
        ? "user_profile"
        : null;
    if (!tableName) return;

    const table = await queryRunner.getTable(tableName);
    if (!table) return;
    const cols = table.columns.map((c) => c.name);

    const displayNameCol = pickColumnName(cols, [
      "display_name",
      "displayName",
    ]);
    const isBlockedCol = pickColumnName(cols, ["is_blocked", "isBlocked"]);

    await queryRunner.query(
      `INSERT INTO "${tableName}" ("id", "username", "${displayNameCol}", "roles", "${isBlockedCol}")
           SELECT $1, $2, $3, $4::text[], $5
           WHERE NOT EXISTS (SELECT 1 FROM "${tableName}" WHERE "username" = $2)`,
      [
        "11111111-1111-4111-8111-111111111111",
        "qa_employee",
        "QA Employee",
        ["employee"],
        false,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "${tableName}" ("id", "username", "${displayNameCol}", "roles", "${isBlockedCol}")
           SELECT $1, $2, $3, $4::text[], $5
           WHERE NOT EXISTS (SELECT 1 FROM "${tableName}" WHERE "username" = $2)`,
      [
        "22222222-2222-4222-8222-222222222222",
        "qa_client",
        "QA Client",
        ["client"],
        false,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "${tableName}" ("id", "username", "${displayNameCol}", "roles", "${isBlockedCol}")
           SELECT $1, $2, $3, $4::text[], $5
           WHERE NOT EXISTS (SELECT 1 FROM "${tableName}" WHERE "username" = $2)`,
      [
        "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "qa_client2",
        "QA Client 2",
        ["client"],
        false,
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = (await queryRunner.hasTable("user_profiles"))
      ? "user_profiles"
      : (await queryRunner.hasTable("user_profile"))
        ? "user_profile"
        : null;
    if (!tableName) return;

    await queryRunner.query(
      `DELETE FROM "${tableName}" WHERE "username" IN ($1, $2, $3)`,
      ["qa_employee", "qa_client", "qa_client2"],
    );
  }
}
