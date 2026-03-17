import { MigrationInterface, QueryRunner } from "typeorm";

function pickColumnName(existing: string[], candidates: string[]): string {
  for (const c of candidates) {
    if (existing.includes(c)) return c;
  }
  return candidates[0];
}

export class Migration1771950500000 implements MigrationInterface {
  name = "Migration1771950500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("creditHooks"))
        ? "creditHooks"
        : null;
    const paymentTable = (await queryRunner.hasTable("credit_payments"))
      ? "credit_payments"
      : (await queryRunner.hasTable("credit_payment"))
        ? "credit_payment"
        : null;
    if (!creditTable || !paymentTable) return;

    const creditMeta = await queryRunner.getTable(creditTable);
    const paymentMeta = await queryRunner.getTable(paymentTable);
    if (!creditMeta || !paymentMeta) return;

    const creditCols = creditMeta.columns.map((c) => c.name);
    const paymentCols = paymentMeta.columns.map((c) => c.name);

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
    const amountCol = pickColumnName(paymentCols, ["amount", "amount"]);
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
      `INSERT INTO "${creditTable}" ("id", "${clientIdCol}", "${accountIdCol}", "${tariffIdCol}", "${principalCol}", "${outstandingCol}", "status", "${issuedAtCol}", "${dueAtCol}", "${closedAtCol}")
           SELECT $1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL '30 days', NOW() - INTERVAL '7 days', NULL
           WHERE NOT EXISTS (SELECT 1 FROM "${creditTable}" WHERE "id" = $1)`,
      [
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        "22222222-2222-4222-8222-222222222222",
        "44444444-4444-4444-8444-444444444444",
        "55555555-5555-4555-8555-555555555555",
        "3000.00",
        "3000.00",
        "active",
      ],
    );

    await queryRunner.query(
      `INSERT INTO "${paymentTable}" ("id", "${paymentCreditIdCol}", "${amountCol}", "${paymentTypeCol}", "${performedByCol}", "${performedAtCol}")
           SELECT $1, $2, $3, $4, $5, NOW() - INTERVAL '30 days'
           WHERE NOT EXISTS (SELECT 1 FROM "${paymentTable}" WHERE "id" = $1)`,
      [
        "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
        "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        "3000.00",
        "issue",
        "system:seed",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const creditTable = (await queryRunner.hasTable("credits"))
      ? "credits"
      : (await queryRunner.hasTable("creditHooks"))
        ? "creditHooks"
        : null;
    const paymentTable = (await queryRunner.hasTable("credit_payments"))
      ? "credit_payments"
      : (await queryRunner.hasTable("credit_payment"))
        ? "credit_payment"
        : null;
    if (!creditTable || !paymentTable) return;

    await queryRunner.query(`DELETE FROM "${paymentTable}" WHERE "id" = $1`, [
      "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    ]);
    await queryRunner.query(`DELETE FROM "${creditTable}" WHERE "id" = $1`, [
      "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    ]);
  }
}
