import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1774346038307 implements MigrationInterface {
    name = 'InitMigration1774346038307'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "employee_code" character varying NOT NULL, "mobile_no" character varying NOT NULL, "name" character varying NOT NULL, "name_marathi" character varying, "status" character varying NOT NULL, "is_system_user" boolean NOT NULL DEFAULT true, "designation_id" integer, "department_id" integer, "reporting_to" integer, CONSTRAINT "UQ_ca16ee8c3305d46c903a92d36f3" UNIQUE ("mobile_no"), CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_d8b49d09788fa8b28f44d0ce3bf" FOREIGN KEY ("designation_id") REFERENCES "ref_designation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_7bbda4c333c1da023d2f2ae7320" FOREIGN KEY ("department_id") REFERENCES "ref_department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_1937bf1fee10277d0df2b67ee8d" FOREIGN KEY ("reporting_to") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_1937bf1fee10277d0df2b67ee8d"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_7bbda4c333c1da023d2f2ae7320"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_d8b49d09788fa8b28f44d0ce3bf"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
    }

}
