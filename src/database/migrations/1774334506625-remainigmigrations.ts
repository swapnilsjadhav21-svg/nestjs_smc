import { MigrationInterface, QueryRunner } from "typeorm";

export class Remainigmigrations1774334506625 implements MigrationInterface {
    name = 'Remainigmigrations1774334506625'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "code" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_32ac3cd1926629ca8aba7ebf1d6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ref_zone" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, CONSTRAINT "PK_d9edf36dd04df02c92982e5e481" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ref_prabhag" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, CONSTRAINT "PK_2748dbc8be4f4d6a00e52e0e41d" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ref_prabhag"`);
        await queryRunner.query(`DROP TABLE "ref_zone"`);
        await queryRunner.query(`DROP TABLE "ref_role"`);
    }

}
