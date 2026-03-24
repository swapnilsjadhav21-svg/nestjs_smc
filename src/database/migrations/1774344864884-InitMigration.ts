import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1774344864884 implements MigrationInterface {
    name = 'InitMigration1774344864884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_citizen" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "mobile_no" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "UQ_1d161d43d6fd68b98a1e10e5520" UNIQUE ("name"), CONSTRAINT "PK_31bcfd353d84d981267a8c8f512" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "app_citizen"`);
    }

}
