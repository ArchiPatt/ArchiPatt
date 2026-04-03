import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1775219438753 implements MigrationInterface {
    name = 'Migration1775219438753'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit" ADD "idempotencyKey" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit" DROP COLUMN "idempotencyKey"`);
    }

}
