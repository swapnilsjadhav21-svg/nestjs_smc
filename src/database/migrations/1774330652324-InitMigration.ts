import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1774330652324 implements MigrationInterface {
    name = 'InitMigration1774330652324'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "code" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_32ac3cd1926629ca8aba7ebf1d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ref_designation" ADD "code" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_designation" DROP COLUMN "code"`);
        await queryRunner.query(`DROP TABLE "ref_role"`);
    }

}
