import { MigrationInterface, QueryRunner } from "typeorm";

export class CoreComplaintsystem1774346394414 implements MigrationInterface {
    name = 'CoreComplaintsystem1774346394414'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "complaint_type" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, CONSTRAINT "PK_b3ea36d336615d18b281d8a5c3c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "complaint_assignment_strategy" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "code" character varying NOT NULL, CONSTRAINT "PK_1eebf352c1d45511007171e056a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "complaint_assignment_config" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "complaint_type_id" integer, "strategy_id" integer, "designation_id" integer, "department_id" integer, CONSTRAINT "PK_5e0167481365c63588526200cdb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" ADD CONSTRAINT "FK_2e889c09a6daaf8da2606a5ab50" FOREIGN KEY ("complaint_type_id") REFERENCES "complaint_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" ADD CONSTRAINT "FK_468033d571736929ff532b8fca3" FOREIGN KEY ("strategy_id") REFERENCES "complaint_assignment_strategy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" ADD CONSTRAINT "FK_39c79e411edcf63c4f1527d7c07" FOREIGN KEY ("designation_id") REFERENCES "ref_designation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" ADD CONSTRAINT "FK_01283c0efea555557f8b7dbdf37" FOREIGN KEY ("department_id") REFERENCES "ref_department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" DROP CONSTRAINT "FK_01283c0efea555557f8b7dbdf37"`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" DROP CONSTRAINT "FK_39c79e411edcf63c4f1527d7c07"`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" DROP CONSTRAINT "FK_468033d571736929ff532b8fca3"`);
        await queryRunner.query(`ALTER TABLE "complaint_assignment_config" DROP CONSTRAINT "FK_2e889c09a6daaf8da2606a5ab50"`);
        await queryRunner.query(`DROP TABLE "complaint_assignment_config"`);
        await queryRunner.query(`DROP TABLE "complaint_assignment_strategy"`);
        await queryRunner.query(`DROP TABLE "complaint_type"`);
    }

}
