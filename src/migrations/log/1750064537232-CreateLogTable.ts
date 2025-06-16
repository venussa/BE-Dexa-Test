import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLogTable1750064537232 implements MigrationInterface {
    name = 'CreateLogTable1750064537232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "logging" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "action" character varying NOT NULL, "before" jsonb, "after" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b6eefd2a39237bdb7e3545fa55" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "logging"`);
    }

}
