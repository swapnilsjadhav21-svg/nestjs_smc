import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { CitizenGuard } from 'src/auth/guards/citizen.guard';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const mockComplaintService = {
  create: jest.fn(),
  findWithFilters: jest.fn(),
  findMyCitizenComplaints: jest.fn(),
  findOne: jest.fn(),
  findAssignedComplaints: jest.fn(),
  findTeamComplaints: jest.fn(),
  citizenUpdate: jest.fn(),
  officerUpdate: jest.fn(),
};

const mockCitizenGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockOfficerGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ComplaintController', () => {
  let controller: ComplaintController;
  const mockUser = { sub: 1, type: 'CITIZEN', mobile: '9876543210' };
  const mockOfficerUser = { sub: 2, type: 'OFFICER', mobile: '8888888888', roles: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintController],
      providers: [{ provide: ComplaintService, useValue: mockComplaintService }],
    })
      .overrideGuard(CitizenGuard).useValue(mockCitizenGuard)
      .overrideGuard(OfficerGuard).useValue(mockOfficerGuard)
      .overrideGuard(JwtAuthGuard).useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ComplaintController>(ComplaintController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1 — controller is defined
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    // Test 2 — creates complaint successfully
    it('should create complaint and return result', async () => {
      const dto = { complaint_type: { id: 1 }, complaint: 'Test complaint' };
      const files: Express.Multer.File[] = [];
      const created = { id: 1, complaint: 'Test complaint', status: 'NEW' };
      mockComplaintService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any, mockUser as any, files);

      expect(result).toEqual(created);
      expect(mockComplaintService.create).toHaveBeenCalledWith(dto, 1, files);
      expect(mockComplaintService.create).toHaveBeenCalledTimes(1);
    });

    // Test 3 — service throws error and controller propagates it
    it('should throw NotFoundException when complaint type not found', async () => {
      const dto = { complaint_type: { id: 999 }, complaint: 'Test complaint' };
      mockComplaintService.create.mockRejectedValue(
        new NotFoundException('Complaint type with id 999 not found'),
      );

      await expect(controller.create(dto as any, mockUser as any, [])).rejects.toThrow(NotFoundException);
    });
  });

  describe('findWithFilters()', () => {
    // Test 4 — returns paginated complaints
    it('should return paginated complaint list', async () => {
      const paginated = { data: [], total: 0, page: 1, page_size: 50 };
      mockComplaintService.findWithFilters.mockResolvedValue(paginated);

      const result = await controller.findWithFilters();

      expect(result).toEqual(paginated);
      expect(mockComplaintService.findWithFilters).toHaveBeenCalledWith({
        zone_id: undefined,
        prabhag_id: undefined,
        department_id: undefined,
        assigned_to: undefined,
        citizen_id: undefined,
        complaint_type_id: undefined,
        status: undefined,
        start_date: undefined,
        end_date: undefined,
        page: 1,
        page_size: 50,
      });
    });

    // Test 5 — passes filters correctly to service
    it('should pass filters to service correctly', async () => {
      const paginated = { data: [], total: 0, page: 1, page_size: 10 };
      mockComplaintService.findWithFilters.mockResolvedValue(paginated);

      await controller.findWithFilters(
        1 as any,
        2 as any,
        undefined,
        undefined,
        undefined,
        undefined,
        'NEW',
        undefined,
        undefined,
        1 as any,
        10 as any,
      );

      expect(mockComplaintService.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({ zone_id: 1, prabhag_id: 2, status: 'NEW', page: 1, page_size: 10 }),
      );
    });
  });

  describe('findMyCitizenComplaints()', () => {
    // Test 6 — returns citizen complaints
    it('should return complaints for current citizen', async () => {
      const list = [{ id: 1 }, { id: 2 }];
      mockComplaintService.findMyCitizenComplaints.mockResolvedValue(list);

      const result = await controller.findMyCitizenComplaints(mockUser as any);

      expect(result).toEqual(list);
      expect(mockComplaintService.findMyCitizenComplaints).toHaveBeenCalledWith(1);
    });

    // Test 7 — returns empty array when no complaints
    it('should return empty array when citizen has no complaints', async () => {
      mockComplaintService.findMyCitizenComplaints.mockResolvedValue([]);

      const result = await controller.findMyCitizenComplaints(mockUser as any);

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    // Test 8 — returns complaint by id
    it('should return complaint by id', async () => {
      const complaint = { id: 1, complaint: 'Test complaint' };
      mockComplaintService.findOne.mockResolvedValue(complaint);

      const result = await controller.findOne(1);

      expect(result).toEqual(complaint);
      expect(mockComplaintService.findOne).toHaveBeenCalledWith(1);
    });

    // Test 9 — throws when complaint not found
    it('should throw NotFoundException when complaint not found', async () => {
      mockComplaintService.findOne.mockRejectedValue(
        new NotFoundException('Complaint with id 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAssignedComplaints()', () => {
    // Test 10 — returns assigned complaints for officer
    it('should return complaints assigned to current officer', async () => {
      const list = [{ id: 1 }];
      mockComplaintService.findAssignedComplaints.mockResolvedValue(list);

      const result = await controller.findAssignedComplaints(mockOfficerUser as any);

      expect(result).toEqual(list);
      expect(mockComplaintService.findAssignedComplaints).toHaveBeenCalledWith(2);
    });

    // Test 11 — returns empty array when no assigned complaints
    it('should return empty array when officer has no assigned complaints', async () => {
      mockComplaintService.findAssignedComplaints.mockResolvedValue([]);

      const result = await controller.findAssignedComplaints(mockOfficerUser as any);

      expect(result).toEqual([]);
    });
  });

  describe('findTeamComplaints()', () => {
    // Test 12 — returns team complaints
    it('should return team complaints for current officer', async () => {
      const list = [{ id: 1 }, { id: 2 }];
      mockComplaintService.findTeamComplaints.mockResolvedValue(list);

      const result = await controller.findTeamComplaints(mockOfficerUser as any);

      expect(result).toEqual(list);
      expect(mockComplaintService.findTeamComplaints).toHaveBeenCalledWith(2);
    });

    // Test 13 — throws when officer has no department
    it('should throw BadRequestException when officer has no department', async () => {
      mockComplaintService.findTeamComplaints.mockRejectedValue(
        new BadRequestException('Officer 2 is not assigned to any department'),
      );

      await expect(controller.findTeamComplaints(mockOfficerUser as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('citizenUpdate()', () => {
    // Test 14 — citizen reopens complaint
    it('should reopen complaint for citizen', async () => {
      const dto = { status: 'REOPENED' };
      mockComplaintService.citizenUpdate.mockResolvedValue({ id: 1, status: 'REOPENED' });

      const result = await controller.citizenUpdate(1, dto as any, mockUser as any);

      expect(result.status).toBe('REOPENED');
      expect(mockComplaintService.citizenUpdate).toHaveBeenCalledWith(1, dto, 1);
    });

    // Test 15 — citizen escalates complaint
    it('should escalate complaint for citizen', async () => {
      const dto = { status: 'ESCALATED' };
      mockComplaintService.citizenUpdate.mockResolvedValue({ id: 1, status: 'ESCALATED' });

      const result = await controller.citizenUpdate(1, dto as any, mockUser as any);

      expect(result.status).toBe('ESCALATED');
      expect(mockComplaintService.citizenUpdate).toHaveBeenCalledWith(1, dto, 1);
    });

    // Test 16 — throws when citizen updates another citizen complaint
    it('should throw ForbiddenException when citizen updates another complaint', async () => {
      mockComplaintService.citizenUpdate.mockRejectedValue(
        new ForbiddenException('You can only update your own complaints'),
      );

      await expect(
        controller.citizenUpdate(1, { status: 'REOPENED' } as any, mockUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    // Test 17 — throws on invalid status transition
    it('should throw BadRequestException on invalid status transition', async () => {
      const dto = { status: 'IN_PROGRESS' };
      mockComplaintService.citizenUpdate.mockRejectedValue(
        new BadRequestException('Cannot transition from ASSIGNED to IN_PROGRESS'),
      );

      await expect(controller.citizenUpdate(1, dto as any, mockUser as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('officerUpdate()', () => {
    // Test 18 — officer updates status
    it('should update complaint status for officer', async () => {
      const dto = { status: 'IN_PROGRESS' };
      mockComplaintService.officerUpdate.mockResolvedValue({ id: 1, status: 'IN_PROGRESS' });

      const result = await controller.officerUpdate(1, dto as any, mockOfficerUser as any);

      expect(result.status).toBe('IN_PROGRESS');
      expect(mockComplaintService.officerUpdate).toHaveBeenCalledWith(1, dto, 2);
    });

    // Test 19 — officer reassigns complaint
    it('should reassign complaint to another officer', async () => {
      const dto = { assigned_to_id: 5 };
      mockComplaintService.officerUpdate.mockResolvedValue({ id: 1, assigned_to: { id: 5 } });

      const result = await controller.officerUpdate(1, dto as any, mockOfficerUser as any);

      expect(result.assigned_to.id).toBe(5);
      expect(mockComplaintService.officerUpdate).toHaveBeenCalledWith(1, dto, 2);
    });

    // Test 20 — officer claims unassigned complaint
    it('should claim unassigned complaint', async () => {
      const dto = { status: 'ASSIGNED' };
      mockComplaintService.officerUpdate.mockResolvedValue({
        id: 1,
        status: 'ASSIGNED',
        assigned_to: { id: 2 },
      });

      const result = await controller.officerUpdate(1, dto as any, mockOfficerUser as any);

      expect(result.status).toBe('ASSIGNED');
      expect(result.assigned_to.id).toBe(2);
    });

    // Test 21 — throws when officer updates complaint not assigned to them
    it('should throw ForbiddenException when officer updates unassigned complaint', async () => {
      mockComplaintService.officerUpdate.mockRejectedValue(
        new ForbiddenException('You can only update status of complaints assigned to you'),
      );

      await expect(
        controller.officerUpdate(1, { status: 'IN_PROGRESS' } as any, mockOfficerUser as any),
      ).rejects.toThrow(ForbiddenException);
    });

    // Test 22 — throws on invalid status transition
    it('should throw BadRequestException on invalid status transition', async () => {
      const dto = { status: 'RESOLVED' };
      mockComplaintService.officerUpdate.mockRejectedValue(
        new BadRequestException('Cannot transition from ASSIGNED to RESOLVED'),
      );

      await expect(controller.officerUpdate(1, dto as any, mockOfficerUser as any)).rejects.toThrow(BadRequestException);
    });

    // Test 23 — throws when reassigning to inactive officer
    it('should throw NotFoundException when reassigning to inactive officer', async () => {
      const dto = { assigned_to_id: 999 };
      mockComplaintService.officerUpdate.mockRejectedValue(
        new NotFoundException('Active officer with id 999 not found'),
      );

      await expect(controller.officerUpdate(1, dto as any, mockOfficerUser as any)).rejects.toThrow(NotFoundException);
    });
  });
});
