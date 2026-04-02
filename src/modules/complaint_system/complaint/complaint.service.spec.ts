import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { Complaint } from './entities/complaint.entity';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { AssignmentEngineService } from './assignment-engine.service';
import { GenMediaService } from '../gen_media/gen_media.service';
import { ComplaintMediaService } from '../complaint_media/complaint_media.service';
import { ComplaintStatus } from './enums/complaint-status.enum';

const mockComplaintRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findAndCount: jest.fn(),
  manager: { findOne: jest.fn() },
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};

const mockAppUserRepo = {
  findOne: jest.fn(),
};

const mockAssignmentEngine = {
  assign: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn(),
};

const mockGenMediaService = {
  upload: jest.fn(),
};

const mockComplaintMediaService = {
  create: jest.fn(),
};

describe('ComplaintService', () => {
  let service: ComplaintService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockComplaintRepo.save.mockImplementation((c) => Promise.resolve(c));
    mockAppUserRepo.findOne.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintService,
        { provide: getRepositoryToken(Complaint), useValue: mockComplaintRepo },
        { provide: getRepositoryToken(AppUser), useValue: mockAppUserRepo },
        { provide: AssignmentEngineService, useValue: mockAssignmentEngine },
        { provide: DataSource, useValue: mockDataSource },
        { provide: GenMediaService, useValue: mockGenMediaService },
        { provide: ComplaintMediaService, useValue: mockComplaintMediaService },
      ],
    }).compile();

    service = module.get<ComplaintService>(ComplaintService);
  });

  describe('Status Transitions - Allowed', () => {
    it('Test 1: NEW -> ASSIGNED (officer claims)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.NEW,
        assigned_to: null,
        citizen: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.ASSIGNED);
    });

    it('Test 2: ASSIGNED -> IN_PROGRESS', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.IN_PROGRESS);
    });

    it('Test 3: IN_PROGRESS -> RESOLVED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.IN_PROGRESS,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.RESOLVED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.RESOLVED);
    });

    it('Test 4: IN_PROGRESS -> REJECTED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.IN_PROGRESS,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.REJECTED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.REJECTED);
    });

    it('Test 5: RESOLVED -> REOPENED (citizen)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.RESOLVED,
        citizen: { id: 1 },
      });

      const action = service.citizenUpdate(1, { status: ComplaintStatus.REOPENED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.REOPENED);
    });

    it('Test 6: REJECTED -> ESCALATED (citizen)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.REJECTED,
        citizen: { id: 1 },
      });

      const action = service.citizenUpdate(1, { status: ComplaintStatus.ESCALATED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.ESCALATED);
    });

    it('Test 7: REOPENED -> ASSIGNED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.REOPENED,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1);
      await expect(action).resolves.not.toThrow();
      const result = await action;
      expect(result.status).toBe(ComplaintStatus.ASSIGNED);
    });
  });

  describe('Status Transitions - Not Allowed', () => {
    it('Test 8: ASSIGNED -> ASSIGNED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1);
      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('Cannot transition from ASSIGNED to ASSIGNED');
    });

    it('Test 9: NEW -> RESOLVED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.NEW,
        assigned_to: { id: 1 },
      });

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.RESOLVED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 10: ASSIGNED -> RESOLVED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 1 },
      });

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.RESOLVED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 11: RESOLVED -> ASSIGNED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.RESOLVED,
        citizen: { id: 1 },
      });

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 12: ESCALATED -> anything not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ESCALATED,
        assigned_to: { id: 1 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1);
      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('Allowed: ');
    });
  });

  describe('Citizen Restrictions', () => {
    it('Test 13: Citizen cannot update own complaint to ASSIGNED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        citizen: { id: 1 },
      });

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 14: Citizen cannot update another citizen complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.RESOLVED,
        citizen: { id: 99 },
      });

      const action = service.citizenUpdate(1, { status: ComplaintStatus.REOPENED } as any, 1);
      await expect(action).rejects.toThrow(ForbiddenException);
      await expect(action).rejects.toThrow('You can only update your own complaints');
    });
  });

  describe('Officer Restrictions', () => {
    it('Test 15: Officer cannot update complaint assigned to someone else', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 99 },
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1);
      await expect(action).rejects.toThrow(ForbiddenException);
      await expect(action).rejects.toThrow('You can only update status of complaints assigned to you');
    });

    it('Test 16: Officer cannot claim already assigned complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.NEW,
        assigned_to: { id: 99 },
      });

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Test 17: Officer cannot claim non-NEW complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue({
        id: 1,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: null,
      });

      const action = service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1);
      await expect(action).rejects.toThrow(BadRequestException);
      await expect(action).rejects.toThrow('Only NEW complaints can be claimed');
    });
  });
});
