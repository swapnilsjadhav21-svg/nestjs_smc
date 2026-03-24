import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1774260204124 implements MigrationInterface {
    name = 'AutoMigration1774260204124'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_department" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, CONSTRAINT "PK_d4cfb90ae1b482b59162948ed92" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ref_department"`);
    }

}
