import { MigrationInterface, QueryRunner } from "typeorm";

export class Prabhagzonemappingupdate1774337560333 implements MigrationInterface {
    name = 'Prabhagzonemappingupdate1774337560333'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" ADD "is_primary" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ref_prabhag_zone_mapping" DROP COLUMN "is_primary"`);
    }

}
