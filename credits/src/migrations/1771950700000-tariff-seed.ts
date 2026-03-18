import { MigrationInterface, QueryRunner } from "typeorm";

function pickColumnName(existing: string[], candidates: string[]): string {
  for (const c of candidates) {
    if (existing.includes(c)) return c;
  }
  return candidates[0];
}

const TARIFFS = [
  { id: "55555555-5555-4555-8555-555555555555", name: "QA Base Tariff", interestRate: "0.0125", billingPeriodDays: 30 },
  { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", name: "Стандарт", interestRate: "0.15", billingPeriodDays: 30 },
  { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", name: "Премиум", interestRate: "0.12", billingPeriodDays: 30 },
  { id: "cccccccc-cccc-4ccc-8ccc-ccccccccccca", name: "Экспресс", interestRate: "0.25", billingPeriodDays: 14 },
];

export class Migration1771950700000 implements MigrationInterface {
  name = "Migration1771950700000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tariffTable = (await queryRunner.hasTable("credit_tariffs"))
      ? "credit_tariffs"
      : (await queryRunner.hasTable("credit_tariff"))
        ? "credit_tariff"
        : null;
    if (!tariffTable) return;

    const tariffMeta = await queryRunner.getTable(tariffTable);
    if (!tariffMeta) return;

    const cols = tariffMeta.columns.map((c) => c.name);
    const interestRateCol = pickColumnName(cols, ["interest_rate", "interestRate"]);
    const billingCol = pickColumnName(cols, ["billing_period_days", "billingPeriodDays"]);
    const isActiveCol = pickColumnName(cols, ["is_active", "isActive"]);

    for (const t of TARIFFS) {
      await queryRunner.query(
        `INSERT INTO "${tariffTable}" ("id", "name", "${interestRateCol}", "${billingCol}", "${isActiveCol}")
         SELECT $1, $2, $3, $4, $5
         WHERE NOT EXISTS (SELECT 1 FROM "${tariffTable}" WHERE "id" = $1)`,
        [t.id, t.name, t.interestRate, t.billingPeriodDays, true],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tariffTable = (await queryRunner.hasTable("credit_tariffs"))
      ? "credit_tariffs"
      : (await queryRunner.hasTable("credit_tariff"))
        ? "credit_tariff"
        : null;
    if (!tariffTable) return;

    for (const t of TARIFFS) {
      await queryRunner.query(`DELETE FROM "${tariffTable}" WHERE "id" = $1`, [t.id]);
    }
  }
}
