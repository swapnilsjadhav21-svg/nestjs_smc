import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  createTestApp,
  cleanDatabase,
  seedTestOfficer,
  ensureComplaintAssignmentSetup,
} from './test-setup';

describe('Complaint API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let citizenToken: string;
  let officerToken: string;
  let complaintTypeId: number;
  let officerId: number;
  let citizenId: number;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    dataSource = setup.dataSource;

    officerId = await seedTestOfficer(dataSource);

    complaintTypeId = await ensureComplaintAssignmentSetup(dataSource);

    await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ mobile_number: '9876543210', user_type: 'CITIZEN' });

    const citizenOtp = await dataSource.query(
      `SELECT otp FROM app_otp WHERE mobile_number = '9876543210'`,
    );

    const citizenAuth = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        mobile_number: '9876543210',
        otp: citizenOtp[0].otp.toString(),
        user_type: 'CITIZEN',
      });

    citizenToken = citizenAuth.body.data.access_token;
    citizenId = citizenAuth.body.data.user.id;

    await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ mobile_number: '8888888888', user_type: 'OFFICER' });

    const officerOtp = await dataSource.query(
      `SELECT otp FROM app_otp WHERE mobile_number = '8888888888'`,
    );

    const officerAuth = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({
        mobile_number: '8888888888',
        otp: officerOtp[0].otp.toString(),
        user_type: 'OFFICER',
      });

    officerToken = officerAuth.body.data.access_token;
  });

  afterAll(async () => {
    await cleanDatabase(dataSource);
    await dataSource.query(`DELETE FROM app_user WHERE employee_code IN ('TEST001')`);
    await app.close();
  });

  afterEach(async () => {
    await dataSource.query('DELETE FROM complaint_media');
    await dataSource.query('DELETE FROM complaint_response_media');
    await dataSource.query('DELETE FROM complaint_response');
    await dataSource.query('DELETE FROM complaint');
    await dataSource.query('DELETE FROM app_otp');
  });

  describe('POST /complaint', () => {
    it('should create complaint successfully with citizen token', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'There is a big pothole near my house');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.complaint).toBe('There is a big pothole near my house');
      expect(['NEW', 'ASSIGNED']).toContain(res.body.data.status);
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaint')
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Test complaint');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 with officer token', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${officerToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Test complaint');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for missing complaint text', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }));

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 404 for invalid complaint type id', async () => {
      const res = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: 99999 }))
        .field('complaint', 'Test complaint');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Complaint type');
    });
  });

  describe('GET /complaint (citizen filter)', () => {
    it('should return citizen complaints using citizen_id filter', async () => {
      await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'My test complaint');

      const res = await request(app.getHttpServer())
        .get(`/complaint?citizen_id=${citizenId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.data)).toBe(true);
      expect(res.body.data.data.length).toBeGreaterThan(0);
      expect(res.body.data.data[0].complaint).toBe('My test complaint');
    });

    it('should also allow officer token on filters endpoint', async () => {
      const res = await request(app.getHttpServer())
        .get(`/complaint?citizen_id=${citizenId}`)
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return empty array when citizen has no complaints', async () => {
      const res = await request(app.getHttpServer())
        .get('/complaint?citizen_id=999999')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toEqual([]);
    });
  });

  describe('GET /complaint/:id', () => {
    it('should return complaint with nested data', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Detailed complaint test');

      const complaintId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .get(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(complaintId);
      expect(res.body.data.citizen).toBeDefined();
      expect(res.body.data.complaint_type).toBeDefined();
    });

    it('should return 404 for non-existent complaint', async () => {
      const res = await request(app.getHttpServer())
        .get('/complaint/99999')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/complaint/1');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /complaint (team filter)', () => {
    it('should return team-filtered complaints for officer', async () => {
      const res = await request(app.getHttpServer())
        .get('/complaint?team=true')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.data)).toBe(true);
    });

    it('should return 404 for citizen token when team filter is requested', async () => {
      const res = await request(app.getHttpServer())
        .get('/complaint?team=true')
        .set('Authorization', `Bearer ${citizenToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PATCH /complaint/:id (officer flow)', () => {
    it('should allow officer to update status of assigned complaint', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Status update test');

      const complaintId = createRes.body.data.id;

      await dataSource.query(
        `
        UPDATE complaint SET assigned_to = $1, status = 'ASSIGNED'
        WHERE id = $2
      `,
        [officerId, complaintId],
      );

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should allow citizen status update via same endpoint', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Citizen update test');

      const complaintId = createRes.body.data.id;

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });

    it('should return 400 for invalid status transition', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Invalid transition test');

      const complaintId = createRes.body.data.id;

      await dataSource.query(
        `
        UPDATE complaint SET assigned_to = $1, status = 'ASSIGNED'
        WHERE id = $2
      `,
        [officerId, complaintId],
      );

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ status: 'RESOLVED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Cannot transition');
    });
  });

  describe('PATCH /complaint/:id (citizen flow)', () => {
    it('should allow citizen to reopen resolved complaint', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Reopen test complaint');

      const complaintId = createRes.body.data.id;

      await dataSource.query(`UPDATE complaint SET status = 'RESOLVED' WHERE id = $1`, [complaintId]);

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ status: 'REOPENED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('REOPENED');
    });

    it('should return 403 when citizen tries to update another citizens complaint', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Another citizen complaint');

      const complaintId = createRes.body.data.id;

      await request(app.getHttpServer())
        .post('/auth/send-otp')
        .send({ mobile_number: '9999999991', user_type: 'CITIZEN' });

      const otp2 = await dataSource.query(
        `SELECT otp FROM app_otp WHERE mobile_number = '9999999991'`,
      );

      const auth2 = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          mobile_number: '9999999991',
          otp: otp2[0].otp.toString(),
          user_type: 'CITIZEN',
        });

      const citizen2Token = auth2.body.data.access_token;

      await dataSource.query(`UPDATE complaint SET status = 'RESOLVED' WHERE id = $1`, [complaintId]);

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${citizen2Token}`)
        .send({ status: 'REOPENED' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('your own complaints');
    });

    it('should return 400 when officer tries invalid citizen-style status update', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Officer invalid update test');

      const complaintId = createRes.body.data.id;

      await dataSource.query(
        `
        UPDATE complaint SET assigned_to = $1, status = 'ASSIGNED'
        WHERE id = $2
      `,
        [officerId, complaintId],
      );

      const res = await request(app.getHttpServer())
        .patch(`/complaint/${complaintId}`)
        .set('Authorization', `Bearer ${officerToken}`)
        .send({ status: 'REOPENED' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /complaint (filters)', () => {
    it('should return paginated complaints', async () => {
      const res = await request(app.getHttpServer())
        .get('/complaint?page=1&page_size=10')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.data).toBeDefined();
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.page_size).toBe(10);
    });

    it('should filter complaints by status', async () => {
      await request(app.getHttpServer())
        .post('/complaint')
        .set('Authorization', `Bearer ${citizenToken}`)
        .field('complaint_type', JSON.stringify({ id: complaintTypeId }))
        .field('complaint', 'Filter test complaint');

      const res = await request(app.getHttpServer())
        .get('/complaint?status=NEW')
        .set('Authorization', `Bearer ${officerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.data.forEach((c: any) => {
        expect(['NEW', 'ASSIGNED']).toContain(c.status);
      });
    });

    it('should return 401 without token', async () => {
      const res = await request(app.getHttpServer()).get('/complaint');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
   });
 });