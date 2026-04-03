import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createTestApp, cleanDatabase, ensureReferenceData } from './test-setup';

describe('Auth API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    dataSource = setup.dataSource;
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await app.close();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM app_otp');
    await dataSource.query('DELETE FROM app_citizen');
  });

  describe('POST /auth/send-otp', () => {
    it('should auto register new citizen and return OTP', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('OTP sent successfully');
      expect(res.body.data.otp).toBeGreaterThanOrEqual(100000);
      expect(res.body.data.otp).toBeLessThanOrEqual(999999);

      const citizen = await dataSource.query(
        `SELECT * FROM app_citizen WHERE mobile_no = '9876543210'`,
      );
      expect(citizen.length).toBe(1);
    });

    it('should not create duplicate citizen on second OTP request', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      const citizens = await dataSource.query(
        `SELECT * FROM app_citizen WHERE mobile_no = '9876543210'`,
      );
      expect(citizens.length).toBe(1);

      const otps = await dataSource.query(
        `SELECT * FROM app_otp WHERE mobile_number = '9876543210'`,
      );
      expect(otps.length).toBe(1);
    });

    it('should return 404 for unknown officer mobile', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '0000000000', user_type: 'OFFICER' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No officer found');
    });

    it('should return 400 for invalid mobile number length', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '12345', user_type: 'CITIZEN' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing user_type', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should return citizen JWT token on correct OTP', async () => {
      const sendRes = await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      const otp = sendRes.body.data.otp.toString();

      const verifyRes = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp,
          user_type: 'CITIZEN',
        });

      expect(verifyRes.status).toBe(201);
      expect(verifyRes.body.success).toBe(true);
      expect(verifyRes.body.data.access_token).toBeDefined();
      expect(verifyRes.body.data.type).toBe('CITIZEN');
    });

    it('should return 401 for wrong OTP', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      const res = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '000000',
          user_type: 'CITIZEN',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid OTP');
    });

    it('should return 400 when OTP not requested first', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: '123456',
          user_type: 'CITIZEN',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please request OTP first');
    });

    it('should return 401 when officer mobile used with CITIZEN type', async () => {
      const { designationId, departmentId } = await ensureReferenceData(dataSource);

      await dataSource.query(`
        INSERT INTO app_user
        (employee_code, mobile_no, name, designation_id, department_id,
         status, is_system_user, is_deleted)
        VALUES ('T001', '9111111111', 'Officer', $1, $2, 'ACTIVE', false, false)
      `, [designationId, departmentId]);

      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9111111111', user_type: 'OFFICER' });

      const otpRecord = await dataSource.query(
        `SELECT otp FROM app_otp WHERE mobile_number = '9111111111'`,
      );

      const res = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9111111111',
          otp: otpRecord[0].otp.toString(),
          user_type: 'CITIZEN',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not registered as a citizen');

      await dataSource.query(`DELETE FROM app_user WHERE mobile_no = '9111111111'`);
    });

    it('should expire OTP after 3 wrong attempts', async () => {
      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/auth/verify-otp')
          .send({
            mobile_number: '9876543210',
            otp: '000000',
            user_type: 'CITIZEN',
          });
      }

      const otpRecord = await dataSource.query(
        `SELECT otp FROM app_otp WHERE mobile_number = '9876543210'`,
      );

      const res = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9876543210',
          otp: otpRecord[0].otp.toString(),
          user_type: 'CITIZEN',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Maximum OTP attempts exceeded');
    });
  });
});