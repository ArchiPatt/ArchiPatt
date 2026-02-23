import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771765160987 implements MigrationInterface {
    name = 'Migration1771765160987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`);
    }

}
