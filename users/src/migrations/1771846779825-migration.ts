import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1771846779825 implements MigrationInterface {
    name = 'Migration1771846779825'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]::text[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profile" ALTER COLUMN "roles" SET DEFAULT ARRAY[]`);
    }

}
