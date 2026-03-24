import { MigrationInterface, QueryRunner } from "typeorm";

export class InitMigration1774346779852 implements MigrationInterface {
    name = 'InitMigration1774346779852'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user_role" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" integer, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_by" integer, "is_deleted" boolean NOT NULL DEFAULT false, "user_id" integer, "role_id" integer, CONSTRAINT "PK_00b3d05ef2cf349712d4bd2513f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "app_user_role" ADD CONSTRAINT "FK_512e252a1919d58533dfbd2514a" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user_role" ADD CONSTRAINT "FK_1f4225686754587fe55c288ddf1" FOREIGN KEY ("role_id") REFERENCES "ref_role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "app_user_role" DROP CONSTRAINT "FK_1f4225686754587fe55c288ddf1"`);
        await queryRunner.query(`ALTER TABLE "app_user_role" DROP CONSTRAINT "FK_512e252a1919d58533dfbd2514a"`);
        await queryRunner.query(`DROP TABLE "app_user_role"`);
    }

}
