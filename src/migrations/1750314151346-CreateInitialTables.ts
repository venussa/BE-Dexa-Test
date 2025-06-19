import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1750314151346 implements MigrationInterface {
    name = 'CreateInitialTables1750314151346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "fcmToken" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "fcmToken"`);
    }

}
