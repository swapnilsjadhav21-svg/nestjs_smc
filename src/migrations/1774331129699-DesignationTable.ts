import { MigrationInterface, QueryRunner } from "typeorm";

export class DesignationTable1774331129699 implements MigrationInterface {
    name = 'DesignationTable1774331129699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_designation" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "code" character varying NOT NULL, "name" character varying NOT NULL, "hierarchy_level" integer NOT NULL, CONSTRAINT "PK_5373d60f7b57f1e287b2e97d1e8" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ref_designation"`);
    }

}
