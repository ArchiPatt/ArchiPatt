import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771852429430 implements MigrationInterface {
    name = 'Migration1771852429430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`);
    }

}
