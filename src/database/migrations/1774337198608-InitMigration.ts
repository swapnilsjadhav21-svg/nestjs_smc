import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1774337198608 implements MigrationInterface {
    name = 'InitMigration1774337198608'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ref_prabhag_zone_mapping" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "prabhag_id" integer, "zone_id" integer, CONSTRAINT "PK_c0a8380e161b44f9a18ece0c971" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" ADD CONSTRAINT "FK_f564d29d6314de74ef6e2c1f416" FOREIGN KEY ("prabhag_id") REFERENCES "ref_prabhag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" ADD CONSTRAINT "FK_0447fc31182ec4f8ee9763dc073" FOREIGN KEY ("zone_id") REFERENCES "ref_zone"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" DROP CONSTRAINT "FK_0447fc31182ec4f8ee9763dc073"`);
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" DROP CONSTRAINT "FK_f564d29d6314de74ef6e2c1f416"`);
        await queryRunner.query(`DROP TABLE "ref_prabhag_zone_mapping"`);
    }

}
