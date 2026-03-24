import { MigrationInterface, QueryRunner } from "typeorm";

export class ComplaintU1774353434067 implements MigrationInterface {
    name = 'ComplaintU1774353434067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "complaint" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "complaint" text NOT NULL, "status" character varying(20) NOT NULL, "location" json, "citizen_id" integer, "complaint_type_id" integer, "assigned_to" integer, "department_id" integer, "zone_id" integer, "prabhag_id" integer, CONSTRAINT "PK_a9c8dbc2ab4988edcc2ff0a7337" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_662ac0777cbff8222ed40eab075" FOREIGN KEY ("citizen_id") REFERENCES "app_citizen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_69f02cf16a7a75804505dcb735e" FOREIGN KEY ("complaint_type_id") REFERENCES "complaint_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_795a5bbf64763f890e82db76690" FOREIGN KEY ("assigned_to") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_7b1dd465c62ba742a427a65a09d" FOREIGN KEY ("department_id") REFERENCES "ref_department"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_4272300259da6370df2f138e669" FOREIGN KEY ("zone_id") REFERENCES "ref_zone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint" ADD CONSTRAINT "FK_36edb70196c80cc39f55b56f4e6" FOREIGN KEY ("prabhag_id") REFERENCES "ref_prabhag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_36edb70196c80cc39f55b56f4e6"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_4272300259da6370df2f138e669"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_7b1dd465c62ba742a427a65a09d"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_795a5bbf64763f890e82db76690"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_69f02cf16a7a75804505dcb735e"`);
        await queryRunner.query(`ALTER TABLE "complaint" DROP CONSTRAINT "FK_662ac0777cbff8222ed40eab075"`);
        await queryRunner.query(`DROP TABLE "complaint"`);
    }

}
