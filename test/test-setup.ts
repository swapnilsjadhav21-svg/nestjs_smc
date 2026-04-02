import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';
import { DataSource } from 'typeorm';

export async function createTestApp(): Promise<{
  app: INestApplication;
  dataSource: DataSource;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  await app.init();

  const dataSource = moduleFixture.get<DataSource>(DataSource);

  return { app, dataSource };
}

export async function cleanDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query('DELETE FROM complaint_media');
  await dataSource.query('DELETE FROM complaint_response_media');
  await dataSource.query('DELETE FROM complaint_response');
  await dataSource.query('DELETE FROM complaint');
  await dataSource.query('DELETE FROM app_otp');
  await dataSource.query('DELETE FROM app_citizen');
  await dataSource.query('DELETE FROM app_user_role');
}

export async function ensureReferenceData(dataSource: DataSource): Promise<{
  designationId: number;
  departmentId: number;
}> {
  let designation = await dataSource.query(
    `SELECT id FROM ref_designation WHERE is_deleted = false ORDER BY id ASC LIMIT 1`,
  );

  if (!designation.length) {
    designation = await dataSource.query(
      `
      INSERT INTO ref_designation (code, name, hierarchy_level, is_deleted)
      VALUES ('TEST_DESIG', 'Test Designation', 1, false)
      RETURNING id
      `,
    );
  }

  let department = await dataSource.query(
    `SELECT id FROM ref_department WHERE is_deleted = false ORDER BY id ASC LIMIT 1`,
  );

  if (!department.length) {
    department = await dataSource.query(
      `
      INSERT INTO ref_department (name, is_deleted)
      VALUES ('Test Department', false)
      RETURNING id
      `,
    );
  }

  return {
    designationId: designation[0].id,
    departmentId: department[0].id,
  };
}

export async function ensureComplaintAssignmentSetup(dataSource: DataSource): Promise<number> {
  const { designationId, departmentId } = await ensureReferenceData(dataSource);

  let strategy = await dataSource.query(
    `SELECT id FROM complaint_assignment_strategy WHERE code = 'ZONE' AND is_deleted = false LIMIT 1`,
  );

  if (!strategy.length) {
    strategy = await dataSource.query(
      `
      INSERT INTO complaint_assignment_strategy (code, is_deleted)
      VALUES ('ZONE', false)
      RETURNING id
      `,
    );
  }

  let complaintType = await dataSource.query(
    `SELECT id FROM complaint_type WHERE is_deleted = false ORDER BY id ASC LIMIT 1`,
  );

  if (!complaintType.length) {
    complaintType = await dataSource.query(
      `
      INSERT INTO complaint_type (name, is_deleted)
      VALUES ('Test Complaint Type', false)
      RETURNING id
      `,
    );
  }

  const config = await dataSource.query(
    `
    SELECT id FROM complaint_assignment_config
    WHERE complaint_type_id = $1 AND is_deleted = false
    LIMIT 1
    `,
    [complaintType[0].id],
  );

  if (!config.length) {
    await dataSource.query(
      `
      INSERT INTO complaint_assignment_config
      (complaint_type_id, strategy_id, designation_id, department_id, is_deleted)
      VALUES ($1, $2, $3, $4, false)
      `,
      [complaintType[0].id, strategy[0].id, designationId, departmentId],
    );
  }

  return complaintType[0].id;
}

export async function seedTestOfficer(dataSource: DataSource): Promise<number> {
  const { designationId, departmentId } = await ensureReferenceData(dataSource);

  const result = await dataSource.query(`
    INSERT INTO app_user
    (employee_code, mobile_no, name, designation_id, department_id, status, is_system_user, is_deleted)
    VALUES ('TEST001', '8888888888', 'Test Officer', $1, $2, 'ACTIVE', false, false)
    RETURNING id
  `, [designationId, departmentId]);
  return result[0].id;
}

export async function seedAdminOfficer(dataSource: DataSource): Promise<number> {
  const { designationId, departmentId } = await ensureReferenceData(dataSource);

  const officerResult = await dataSource.query(`
    INSERT INTO app_user
    (employee_code, mobile_no, name, designation_id, department_id, status, is_system_user, is_deleted)
    VALUES ('ADMIN001', '7777777777', 'Admin Officer', $1, $2, 'ACTIVE', true, false)
    RETURNING id
  `, [designationId, departmentId]);
  const officerId = officerResult[0].id;

  const roleResult = await dataSource.query(`
    SELECT id FROM ref_role WHERE code = 'ADMIN' LIMIT 1
  `);

  if (roleResult.length > 0) {
    await dataSource.query(
      `
      INSERT INTO app_user_role (user_id, role_id, is_deleted)
      VALUES ($1, $2, false)
      `,
      [officerId, roleResult[0].id],
    );
  }

  return officerId;
}
