import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogTable1750079851659 implements MigrationInterface {
    name = 'CreateLogTable1750079851659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logging" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "action" character varying NOT NULL, "before" jsonb, "after" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b6eefd2a39237bdb7e3545fa55" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2e7e6843308daa3414b8afe1d1" ON "logging" ("userId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_2e7e6843308daa3414b8afe1d1"`);
        await queryRunner.query(`DROP TABLE "logging"`);
    }

}
