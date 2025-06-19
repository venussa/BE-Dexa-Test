import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from "typeorm";
import { format } from 'date-fns';

export class CreateInitialTables1750285906360 implements MigrationInterface {
    name = 'CreateInitialTables1750285906360'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "name" character varying NOT NULL, "position" character varying NOT NULL, "address" text, "bio" text, "photoUrl" text, "phone" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'USER', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."attendance_type_enum" NOT NULL, "timestamp" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_466e85b813d871bfb693f443528" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash("Password123", salt);
        const dateNow = format(new Date, "yyyy-MM-dd HH:mm:ss");
        
        await queryRunner.query(`
            INSERT INTO "user" (id, name, email, bio, address, password, phone, position, role, "photoUrl", "createdAt", "updatedAt")
            VALUES (
                gen_random_uuid(),
                'Dexa Admin',
                'admin@dexa.com',
                'Defender of The Lost Technology',
                'Bogor, Jawa Barat, Indonesia',
                '${hashedPassword}',
                '082110871185',
                'Super Admin',
                'ADMIN',
                'https://cdn.i-scmp.com/sites/default/files/d8/images/canvas/2022/06/10/826e71be-82da-475a-bec4-abb9ef4feb3c_e17d1928.jpg',
                '${dateNow}',
                '${dateNow}'
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_466e85b813d871bfb693f443528"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
