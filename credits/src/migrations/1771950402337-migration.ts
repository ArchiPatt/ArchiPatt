import { MigrationInterface, QueryRunner } from "typeorm";

function pickColumnName(existing: string[], candidates: string[]): string {
  for (const c of candidates) {
    if (existing.includes(c)) return c;
  }
  return candidates[0];
}

export class Migration1771950402337 implements MigrationInterface {
  name = "Migration1771950402337";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tariffTable = (await queryRunner.hasTable("credit_tariffs"))
      ? "credit_tariffs"
      : (await queryRunner.hasTable("credit_tariff"))
        ? "credit_tariff"
        : null;
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("credit"))
        ? "credit"
        : (await queryRunner.hasTable("creditHooks"))
          ? "creditHooks"
          : null;
    const paymentTable = (await queryRunner.hasTable("credit_payments"))
      ? "credit_payments"
      : (await queryRunner.hasTable("credit_payment"))
        ? "credit_payment"
        : null;
    if (!tariffTable || !creditTable || !paymentTable) return;

    const tariffMeta = await queryRunner.getTable(tariffTable);
    const creditMeta = await queryRunner.getTable(creditTable);
    const paymentMeta = await queryRunner.getTable(paymentTable);
    if (!tariffMeta || !creditMeta || !paymentMeta) return;

    const tariffCols = tariffMeta.columns.map((c) => c.name);
    const creditCols = creditMeta.columns.map((c) => c.name);
    const paymentCols = paymentMeta.columns.map((c) => c.name);

    const interestRateCol = pickColumnName(tariffCols, [
      "interest_rate",
      "interestRate",
    ]);
    const billingCol = pickColumnName(tariffCols, [
      "billing_period_days",
      "billingPeriodDays",
    ]);
    const isActiveCol = pickColumnName(tariffCols, ["is_active", "isActive"]);

    const clientIdCol = pickColumnName(creditCols, ["client_id", "clientId"]);
    const accountIdCol = pickColumnName(creditCols, [
      "account_id",
      "accountId",
    ]);
    const tariffIdCol = pickColumnName(creditCols, ["tariff_id", "tariffId"]);
    const principalCol = pickColumnName(creditCols, [
      "principal_amount",
      "principalAmount",
    ]);
    const outstandingCol = pickColumnName(creditCols, [
      "outstanding_amount",
      "outstandingAmount",
    ]);
    const issuedAtCol = pickColumnName(creditCols, ["issued_at", "issuedAt"]);
    const dueAtCol = pickColumnName(creditCols, [
      "next_payment_due_at",
      "nextPaymentDueAt",
    ]);
    const closedAtCol = pickColumnName(creditCols, ["closed_at", "closedAt"]);

    const paymentCreditIdCol = pickColumnName(paymentCols, [
      "credit_id",
      "creditId",
    ]);
    const paymentTypeCol = pickColumnName(paymentCols, [
      "payment_type",
      "paymentType",
    ]);
    const performedByCol = pickColumnName(paymentCols, [
      "performed_by",
      "performedBy",
    ]);
    const performedAtCol = pickColumnName(paymentCols, [
      "performed_at",
      "performedAt",
    ]);

    await queryRunner.query(
      `INSERT INTO "${tariffTable}" ("id", "name", "${interestRateCol}", "${billingCol}", "${isActiveCol}")
           SELECT $1, $2, $3, $4, $5
           WHERE NOT EXISTS (SELECT 1 FROM "${tariffTable}" WHERE "id" = $1)`,
      [
        "55555555-5555-4555-8555-555555555555",
        "QA Base Tariff",
        "0.0125",
        30,
        true,
      ],
    );

    await queryRunner.query(
      `INSERT INTO "${creditTable}" ("id", "${clientIdCol}", "${accountIdCol}", "${tariffIdCol}", "${principalCol}", "${outstandingCol}", "status", "${issuedAtCol}", "${dueAtCol}", "${closedAtCol}")
           SELECT $1, $2, $3, $4, $5, $6, $7, NOW(), NOW() + INTERVAL '30 days', NULL
           WHERE NOT EXISTS (SELECT 1 FROM "${creditTable}" WHERE "id" = $1)`,
      [
        "66666666-6666-4666-8666-666666666666",
        "22222222-2222-4222-8222-222222222222",
        "33333333-3333-4333-8333-333333333333",
        "55555555-5555-4555-8555-555555555555",
        "5000.00",
        "5000.00",
        "active",
      ],
    );

    await queryRunner.query(
      `INSERT INTO "${paymentTable}" ("id", "${paymentCreditIdCol}", "amount", "${paymentTypeCol}", "${performedByCol}", "${performedAtCol}")
           SELECT $1, $2, $3, $4, $5, NOW()
           WHERE NOT EXISTS (SELECT 1 FROM "${paymentTable}" WHERE "id" = $1)`,
      [
        "77777777-7777-4777-8777-777777777770",
        "66666666-6666-4666-8666-666666666666",
        "5000.00",
        "issue",
        "system:seed",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tariffTable = (await queryRunner.hasTable("credit_tariffs"))
      ? "credit_tariffs"
      : (await queryRunner.hasTable("credit_tariff"))
        ? "credit_tariff"
        : null;
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("credit"))
        ? "credit"
        : (await queryRunner.hasTable("creditHooks"))
          ? "creditHooks"
          : null;
    const paymentTable = (await queryRunner.hasTable("credit_payments"))
      ? "credit_payments"
      : (await queryRunner.hasTable("credit_payment"))
        ? "credit_payment"
        : null;
    if (!tariffTable || !creditTable || !paymentTable) return;

    await queryRunner.query(`DELETE FROM "${paymentTable}" WHERE "id" = $1`, [
      "77777777-7777-4777-8777-777777777770",
    ]);
    await queryRunner.query(`DELETE FROM "${creditTable}" WHERE "id" = $1`, [
      "66666666-6666-4666-8666-666666666666",
    ]);
    await queryRunner.query(`DELETE FROM "${tariffTable}" WHERE "id" = $1`, [
      "55555555-5555-4555-8555-555555555555",
    ]);
  }
}
