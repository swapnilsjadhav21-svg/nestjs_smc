import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { Complaint } from './entities/complaint.entity';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { AssignmentEngineService } from './assignment-engine.service';
import { GenMediaService } from '../gen_media/gen_media.service';
import { ComplaintMediaService } from '../complaint_media/complaint_media.service';
import { ComplaintStatus } from './enums/complaint-status.enum';
import { ComplaintType } from '../complaint_type/entities/complaint_type.entity';
import { Prabhag } from '../../reference_tables/prabhag/entities/prabhag.entity';

// --- Mocks ---
const mockComplaintRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findAndCount: jest.fn(),
  manager: { findOne: jest.fn() },
  createQueryBuilder: jest.fn(),
};

const mockAppUserRepo = {
  findOne: jest.fn(),
};

const mockAssignmentEngine = {
  assign: jest.fn(),
};

const mockGenMediaService = {
  upload: jest.fn(),
};

const mockComplaintMediaService = {
  create: jest.fn(),
};

const mockManager = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
};

const mockDataSource = {
  transaction: jest.fn().mockImplementation((cb) => cb(mockManager)),
};

// --- Helper ---
const makeComplaint = (overrides: any = {}): Complaint => ({
  id: 1,
  citizen: { id: 10 } as any,
  complaint_type: { id: 1 } as any,
  complaint: 'Test complaint',
  status: ComplaintStatus.NEW,
  assigned_to: null,
  department: null,
  zone: null,
  prabhag: null,
  location: null,
  is_deleted: false,
  created_at: new Date(),
  updated_at: new Date(),
  created_by: null,
  updated_by: null,
  ...overrides,
} as unknown as Complaint);

describe('ComplaintService', () => {
  let service: ComplaintService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Default save just returns whatever was passed in
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // create()
  // ─────────────────────────────────────────────
  describe('create', () => {
    const dto = {
      complaint_type: { id: 1 },
      complaint: 'Pothole near my house',
      prabhag: { id: 2 },
      location: null,
    };

    it('should throw NotFoundException if complaint type not found', async () => {
      mockComplaintRepo.manager.findOne
        .mockResolvedValueOnce(null)  // call 1: not found
        .mockResolvedValueOnce(null); // call 2: not found

      await expect(service.create(dto as any, 10)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto as any, 10)).rejects.toThrow(
        'Complaint type with id 1 not found',
      );
    });

    it('should throw NotFoundException if prabhag not found', async () => {
      mockComplaintRepo.manager.findOne
        .mockResolvedValueOnce({ id: 1 } as ComplaintType)  // call 1: type found
        .mockResolvedValueOnce(null)                         // call 1: prabhag not found
        .mockResolvedValueOnce({ id: 1 } as ComplaintType)  // call 2: type found
        .mockResolvedValueOnce(null);                        // call 2: prabhag not found

      await expect(service.create(dto as any, 10)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto as any, 10)).rejects.toThrow(
        'Prabhag with id 2 not found',
      );
    });

    it('should create complaint and run assignment engine', async () => {
      const savedComplaint = makeComplaint();

      mockComplaintRepo.manager.findOne
        .mockResolvedValueOnce({ id: 1 } as ComplaintType)
        .mockResolvedValueOnce({ id: 2 } as Prabhag);

      mockManager.create.mockReturnValue(savedComplaint);
      mockManager.save.mockResolvedValue(savedComplaint);
      mockAssignmentEngine.assign.mockResolvedValue({
        officer: { id: 5 } as AppUser,
        zone_id: 3,
        department_id: 2,
      });

      const result = await service.create(dto as any, 10);

      expect(mockAssignmentEngine.assign).toHaveBeenCalledWith(1, 2);
      expect(mockManager.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should create complaint without files', async () => {
      const savedComplaint = makeComplaint();

      mockComplaintRepo.manager.findOne
        .mockResolvedValueOnce({ id: 1 } as ComplaintType)
        .mockResolvedValueOnce({ id: 2 } as Prabhag);

      mockManager.create.mockReturnValue(savedComplaint);
      mockManager.save.mockResolvedValue(savedComplaint);
      mockAssignmentEngine.assign.mockResolvedValue({
        officer: null,
        zone_id: null,
        department_id: null,
      });

      const result = await service.create(dto as any, 10, []);

      expect(result).toBeDefined();
      expect(result.status).toBe(ComplaintStatus.NEW);
    });
  });

  // ─────────────────────────────────────────────
  // findOne()
  // ─────────────────────────────────────────────
  describe('findOne', () => {
    it('should return complaint when found', async () => {
      const complaint = makeComplaint();
      mockComplaintRepo.findOne.mockResolvedValue(complaint);

      const result = await service.findOne(1);

      expect(result).toEqual(complaint);
      expect(mockComplaintRepo.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when complaint not found', async () => {
      mockComplaintRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Complaint with id 999 not found',
      );
    });
  });

  // ─────────────────────────────────────────────
  // findMyCitizenComplaints()
  // ─────────────────────────────────────────────
  describe('findMyCitizenComplaints', () => {
    it('should return complaints for a citizen', async () => {
      const complaints = [makeComplaint(), makeComplaint({ id: 2 })];
      mockComplaintRepo.find.mockResolvedValue(complaints);

      const result = await service.findMyCitizenComplaints(10);

      expect(result).toEqual(complaints);
      expect(mockComplaintRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { citizen: { id: 10 }, is_deleted: false },
        }),
      );
    });

    it('should return empty array when citizen has no complaints', async () => {
      mockComplaintRepo.find.mockResolvedValue([]);

      const result = await service.findMyCitizenComplaints(10);

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────
  // findAssignedComplaints()
  // ─────────────────────────────────────────────
  describe('findAssignedComplaints', () => {
    it('should return complaints assigned to officer', async () => {
      const complaints = [makeComplaint({ assigned_to: { id: 5 } })];
      mockComplaintRepo.find.mockResolvedValue(complaints);

      const result = await service.findAssignedComplaints(5);

      expect(result).toEqual(complaints);
      expect(mockComplaintRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { assigned_to: { id: 5 }, is_deleted: false },
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // findTeamComplaints()
  // ─────────────────────────────────────────────
  describe('findTeamComplaints', () => {
    it('should throw NotFoundException when officer not found', async () => {
      mockAppUserRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(service.findTeamComplaints(99)).rejects.toThrow(NotFoundException);
      await expect(service.findTeamComplaints(99)).rejects.toThrow(
        'Officer with id 99 not found',
      );
    });

    it('should throw BadRequestException when officer has no department', async () => {
      mockAppUserRepo.findOne
        .mockResolvedValueOnce({ id: 5, department: null } as unknown as AppUser)
        .mockResolvedValueOnce({ id: 5, department: null } as unknown as AppUser);

      await expect(service.findTeamComplaints(5)).rejects.toThrow(BadRequestException);
      await expect(service.findTeamComplaints(5)).rejects.toThrow(
        'Officer 5 is not assigned to any department',
      );
    });

    it('should return team complaints when officer has department', async () => {
      const complaints = [makeComplaint(), makeComplaint({ id: 2 })];

      mockAppUserRepo.findOne.mockResolvedValue({ id: 5, department: { id: 1 } } as AppUser);

      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(complaints),
      };
      mockComplaintRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findTeamComplaints(5);

      expect(result).toEqual(complaints);
      expect(mockQB.getMany).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────
  // citizenUpdate()
  // ─────────────────────────────────────────────
  describe('citizenUpdate', () => {
    it('should throw ForbiddenException when citizen updates another citizens complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ citizen: { id: 99 } }),
      );

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.REOPENED }, 10),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.REOPENED }, 10),
      ).rejects.toThrow('You can only update your own complaints');
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ citizen: { id: 10 }, status: ComplaintStatus.NEW }),
      );

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.REOPENED }, 10),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update status for valid transition', async () => {
      const complaint = makeComplaint({
        citizen: { id: 10 },
        status: ComplaintStatus.RESOLVED,
      });

      mockComplaintRepo.findOne.mockResolvedValue(complaint);
      mockComplaintRepo.save.mockResolvedValue({
        ...complaint,
        status: ComplaintStatus.REOPENED,
      });

      const result = await service.citizenUpdate(
        1,
        { status: ComplaintStatus.REOPENED },
        10,
      );

      expect(result.status).toBe(ComplaintStatus.REOPENED);
      expect(mockComplaintRepo.save).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────
  // officerUpdate()
  // ─────────────────────────────────────────────
  describe('officerUpdate', () => {
    it('should throw ForbiddenException when officer updates complaint not assigned to them', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 99 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS }, 5),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow officer to claim a NEW unassigned complaint', async () => {
      const complaint = makeComplaint({ status: ComplaintStatus.NEW, assigned_to: null });

      mockComplaintRepo.findOne.mockResolvedValue(complaint);
      mockComplaintRepo.save.mockResolvedValue({
        ...complaint,
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 5 },
      });

      const result = await service.officerUpdate(
        1,
        { status: ComplaintStatus.ASSIGNED },
        5,
      );

      expect(result.status).toBe(ComplaintStatus.ASSIGNED);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.RESOLVED, assigned_to: { id: 5 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS }, 5),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reassign complaint to another officer', async () => {
      const complaint = makeComplaint({
        status: ComplaintStatus.ASSIGNED,
        assigned_to: { id: 5 },
      });
      const newOfficer = { id: 7, status: 'ACTIVE' } as AppUser;

      mockComplaintRepo.findOne.mockResolvedValue(complaint);
      mockAppUserRepo.findOne.mockResolvedValue(newOfficer);
      mockComplaintRepo.save.mockResolvedValue({ ...complaint, assigned_to: newOfficer });

      const result = await service.officerUpdate(1, { assigned_to_id: 7 }, 5);

      expect(result.assigned_to).toEqual(newOfficer);
    });

    it('should throw NotFoundException when reassigning to non-existent officer', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 5 } }),
      );
      mockAppUserRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      await expect(
        service.officerUpdate(1, { assigned_to_id: 99 }, 5),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.officerUpdate(1, { assigned_to_id: 99 }, 5),
      ).rejects.toThrow('Active officer with id 99 not found');
    });
  });

  // ─────────────────────────────────────────────
  // findWithFilters()
  // ─────────────────────────────────────────────
  describe('findWithFilters', () => {
    it('should return paginated results with default page and page_size', async () => {
      const complaints = [makeComplaint(), makeComplaint({ id: 2 })];
      mockComplaintRepo.findAndCount.mockResolvedValue([complaints, 2]);

      const result = await service.findWithFilters({});

      expect(result.page).toBe(1);
      expect(result.page_size).toBe(50);
      expect(result.total).toBe(2);
      expect(result.data).toEqual(complaints);
    });

    it('should apply status filter', async () => {
      mockComplaintRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ status: 'NEW' });

      expect(mockComplaintRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'NEW' }),
        }),
      );
    });

    it('should apply pagination correctly', async () => {
      mockComplaintRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ page: 2, page_size: 10 });

      expect(mockComplaintRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });

    it('should apply zone filter', async () => {
      mockComplaintRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ zone_id: 3 });

      expect(mockComplaintRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ zone: { id: 3 } }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      mockComplaintRepo.findAndCount.mockResolvedValue([[], 0]);

      await service.findWithFilters({ start_date: '2026-01-01', end_date: '2026-03-31' });

      expect(mockComplaintRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ created_at: expect.anything() }),
        }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // Status Transitions — Allowed (from friend)
  // ─────────────────────────────────────────────
  describe('Status Transitions - Allowed', () => {
    it('Test 1: NEW -> ASSIGNED (officer claims)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.NEW, assigned_to: null, citizen: { id: 1 } }),
      );

      const result = await service.officerUpdate(
        1, { status: ComplaintStatus.ASSIGNED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.ASSIGNED);
    });

    it('Test 2: ASSIGNED -> IN_PROGRESS', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 1 } }),
      );

      const result = await service.officerUpdate(
        1, { status: ComplaintStatus.IN_PROGRESS } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.IN_PROGRESS);
    });

    it('Test 3: IN_PROGRESS -> RESOLVED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.IN_PROGRESS, assigned_to: { id: 1 } }),
      );

      const result = await service.officerUpdate(
        1, { status: ComplaintStatus.RESOLVED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.RESOLVED);
    });

    it('Test 4: IN_PROGRESS -> REJECTED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.IN_PROGRESS, assigned_to: { id: 1 } }),
      );

      const result = await service.officerUpdate(
        1, { status: ComplaintStatus.REJECTED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.REJECTED);
    });

    it('Test 5: RESOLVED -> REOPENED (citizen)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.RESOLVED, citizen: { id: 1 } }),
      );

      const result = await service.citizenUpdate(
        1, { status: ComplaintStatus.REOPENED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.REOPENED);
    });

    it('Test 6: REJECTED -> ESCALATED (citizen)', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.REJECTED, citizen: { id: 1 } }),
      );

      const result = await service.citizenUpdate(
        1, { status: ComplaintStatus.ESCALATED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.ESCALATED);
    });

    it('Test 7: REOPENED -> ASSIGNED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.REOPENED, assigned_to: { id: 1 } }),
      );

      const result = await service.officerUpdate(
        1, { status: ComplaintStatus.ASSIGNED } as any, 1,
      );
      expect(result.status).toBe(ComplaintStatus.ASSIGNED);
    });
  });

  // ─────────────────────────────────────────────
  // Status Transitions — Not Allowed (from friend)
  // ─────────────────────────────────────────────
  describe('Status Transitions - Not Allowed', () => {
    it('Test 8: ASSIGNED -> ASSIGNED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 1 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 9: NEW -> RESOLVED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.NEW, assigned_to: { id: 1 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.RESOLVED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 10: ASSIGNED -> RESOLVED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 1 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.RESOLVED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 11: RESOLVED -> ASSIGNED not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.RESOLVED, citizen: { id: 1 } }),
      );

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 12: ESCALATED -> anything not allowed', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ESCALATED, assigned_to: { id: 1 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // Citizen Restrictions (from friend)
  // ─────────────────────────────────────────────
  describe('Citizen Restrictions', () => {
    it('Test 13: Citizen cannot update own complaint to ASSIGNED', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, citizen: { id: 1 } }),
      );

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('Test 14: Citizen cannot update another citizen complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.RESOLVED, citizen: { id: 99 } }),
      );

      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.REOPENED } as any, 1),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.citizenUpdate(1, { status: ComplaintStatus.REOPENED } as any, 1),
      ).rejects.toThrow('You can only update your own complaints');
    });
  });

  // ─────────────────────────────────────────────
  // Officer Restrictions (from friend)
  // ─────────────────────────────────────────────
  describe('Officer Restrictions', () => {
    it('Test 15: Officer cannot update complaint assigned to someone else', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: { id: 99 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.IN_PROGRESS } as any, 1),
      ).rejects.toThrow('You can only update status of complaints assigned to you');
    });

    it('Test 16: Officer cannot claim already assigned complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.NEW, assigned_to: { id: 99 } }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Test 17: Officer cannot claim non-NEW complaint', async () => {
      mockComplaintRepo.findOne.mockResolvedValue(
        makeComplaint({ status: ComplaintStatus.ASSIGNED, assigned_to: null }),
      );

      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.officerUpdate(1, { status: ComplaintStatus.ASSIGNED } as any, 1),
      ).rejects.toThrow('Only NEW complaints can be claimed');
    });
  });
});