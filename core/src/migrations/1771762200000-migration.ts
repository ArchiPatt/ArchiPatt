import { MigrationInterface, QueryRunner } from "typeorm";

function pickColumnName(existing: string[], candidates: string[]): string {
  for (const c of candidates) {
    if (existing.includes(c)) return c;
  }
  return candidates[0];
}

export class Migration1771762200000 implements MigrationInterface {
  name = "Migration1771762200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const accountTable = (await queryRunner.hasTable("accounts"))
      ? "accounts"
      : (await queryRunner.hasTable("account"))
        ? "account"
        : null;
    const operationTable = (await queryRunner.hasTable("account_operations"))
      ? "account_operations"
      : (await queryRunner.hasTable("account_operation"))
        ? "account_operation"
        : null;
    if (!accountTable || !operationTable) return;

    const accountMeta = await queryRunner.getTable(accountTable);
    const opMeta = await queryRunner.getTable(operationTable);
    if (!accountMeta || !opMeta) return;

    const accountCols = accountMeta.columns.map((c) => c.name);
    const opCols = opMeta.columns.map((c) => c.name);

    const clientIdCol = pickColumnName(accountCols, ["client_id", "clientId"]);
    const balanceCol = pickColumnName(accountCols, ["balance"]);
    const statusCol = pickColumnName(accountCols, ["status"]);

    const accountIdCol = pickColumnName(opCols, ["account_id", "accountId"]);
    const correlationIdCol = pickColumnName(opCols, ["correlation_id", "correlationId"]);
    const idempotencyKeyCol = pickColumnName(opCols, ["idempotency_key", "idempotencyKey"]);

    await queryRunner.query(
      `INSERT INTO "${accountTable}" ("id", "${clientIdCol}", "${balanceCol}", "${statusCol}")
       SELECT $1, $2, $3, $4
       WHERE NOT EXISTS (SELECT 1 FROM "${accountTable}" WHERE "id" = $1)`,
      [
        "33333333-3333-4333-8333-333333333333",
        "22222222-2222-4222-8222-222222222222",
        "15000.00",
        "open"
      ]
    );

    await queryRunner.query(
      `INSERT INTO "${operationTable}" ("id", "${accountIdCol}", "amount", "type", "${correlationIdCol}", "${idempotencyKeyCol}", "meta")
       SELECT $1, $2, $3, $4, $5, $6, $7::jsonb
       WHERE NOT EXISTS (SELECT 1 FROM "${operationTable}" WHERE "id" = $1)`,
      [
        "44444444-4444-4444-8444-444444444444",
        "33333333-3333-4333-8333-333333333333",
        "15000.00",
        "seed_deposit",
        null,
        "seed-core-qa-1",
        JSON.stringify({ source: "migration" })
      ]
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const accountTable = (await queryRunner.hasTable("accounts"))
      ? "accounts"
      : (await queryRunner.hasTable("account"))
        ? "account"
        : null;
    const operationTable = (await queryRunner.hasTable("account_operations"))
      ? "account_operations"
      : (await queryRunner.hasTable("account_operation"))
        ? "account_operation"
        : null;
    if (!accountTable || !operationTable) return;

    await queryRunner.query(
      `DELETE FROM "${operationTable}" WHERE "id" = $1`,
      ["44444444-4444-4444-8444-444444444444"]
    );
    await queryRunner.query(
      `DELETE FROM "${accountTable}" WHERE "id" = $1`,
      ["33333333-3333-4333-8333-333333333333"]
    );
  }
}
