import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ComplaintController } from './complaint.controller';
import { ComplaintService } from './complaint.service';
import { CitizenGuard } from 'src/auth/guards/citizen.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

const mockComplaintService = {
  create: jest.fn(),
  findWithFilters: jest.fn(),
  findOne: jest.fn(),
  citizenUpdate: jest.fn(),
  officerUpdate: jest.fn(),
};

const mockCitizenGuard = { canActivate: jest.fn().mockReturnValue(true) };
const mockJwtAuthGuard = { canActivate: jest.fn().mockReturnValue(true) };

describe('ComplaintController', () => {
  let controller: ComplaintController;
  const mockCitizenUser = { sub: 1, type: 'CITIZEN', mobile: '9876543210' };
  const mockOfficerUser = { sub: 2, type: 'OFFICER', mobile: '8888888888', roles: [] };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintController],
      providers: [{ provide: ComplaintService, useValue: mockComplaintService }],
    })
      .overrideGuard(CitizenGuard)
      .useValue(mockCitizenGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<ComplaintController>(ComplaintController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create complaint and return result', async () => {
      const dto = { complaint_type: { id: 1 }, complaint: 'Test complaint' };
      const files: Express.Multer.File[] = [];
      const created = { id: 1, complaint: 'Test complaint', status: 'NEW' };
      mockComplaintService.create.mockResolvedValue(created);

      const result = await controller.create(dto as any, mockCitizenUser as any, files);

      expect(result).toEqual(created);
      expect(mockComplaintService.create).toHaveBeenCalledWith(dto, 1, files);
    });

    it('should throw NotFoundException when complaint type not found', async () => {
      const dto = { complaint_type: { id: 999 }, complaint: 'Test complaint' };
      mockComplaintService.create.mockRejectedValue(
        new NotFoundException('Complaint type with id 999 not found'),
      );

      await expect(controller.create(dto as any, mockCitizenUser as any, [])).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findWithFilters()', () => {
    it('should return paginated complaint list with defaults', async () => {
      const paginated = { data: [], total: 0, page: 1, page_size: 50 };
      mockComplaintService.findWithFilters.mockResolvedValue(paginated);

      const result = await controller.findWithFilters(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        mockOfficerUser as any,
      );

      expect(result).toEqual(paginated);
      expect(mockComplaintService.findWithFilters).toHaveBeenCalledWith({
        zone_id: undefined,
        prabhag_id: undefined,
        department_id: undefined,
        assigned_to: undefined,
        citizen_id: undefined,
        complaint_type_id: undefined,
        status: undefined,
        team_officer_id: undefined,
        start_date: undefined,
        end_date: undefined,
        page: 1,
        page_size: 50,
      });
    });

    it('should pass team filter using logged-in user id', async () => {
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
        'true',
        undefined,
        undefined,
        1 as any,
        10 as any,
        mockOfficerUser as any,
      );

      expect(mockComplaintService.findWithFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          zone_id: 1,
          prabhag_id: 2,
          status: 'NEW',
          team_officer_id: 2,
          page: 1,
          page_size: 10,
        }),
      );
    });
  });

  describe('findOne()', () => {
    it('should return complaint by id', async () => {
      const complaint = { id: 1, complaint: 'Test complaint' };
      mockComplaintService.findOne.mockResolvedValue(complaint);

      const result = await controller.findOne(1);

      expect(result).toEqual(complaint);
      expect(mockComplaintService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('updateComplaint()', () => {
    it('should call citizenUpdate for citizen user', async () => {
      const dto = { status: 'REOPENED' };
      mockComplaintService.citizenUpdate.mockResolvedValue({ id: 1, status: 'REOPENED' });

      const result = await controller.updateComplaint(1, dto as any, mockCitizenUser as any);

      expect(result.status).toBe('REOPENED');
      expect(mockComplaintService.citizenUpdate).toHaveBeenCalledWith(1, dto, 1);
      expect(mockComplaintService.officerUpdate).not.toHaveBeenCalled();
    });

    it('should call officerUpdate for officer user', async () => {
      const dto = { status: 'IN_PROGRESS' };
      mockComplaintService.officerUpdate.mockResolvedValue({ id: 1, status: 'IN_PROGRESS' });

      const result = await controller.updateComplaint(1, dto as any, mockOfficerUser as any);

      expect(result.status).toBe('IN_PROGRESS');
      expect(mockComplaintService.officerUpdate).toHaveBeenCalledWith(1, dto, 2);
      expect(mockComplaintService.citizenUpdate).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      mockComplaintService.citizenUpdate.mockRejectedValue(
        new BadRequestException('Cannot transition from ASSIGNED to IN_PROGRESS'),
      );

      await expect(
        controller.updateComplaint(1, { status: 'IN_PROGRESS' } as any, mockCitizenUser as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException for unsupported user type', async () => {
      await expect(
        controller.updateComplaint(1, { status: 'IN_PROGRESS' } as any, {
          sub: 3,
          type: 'ADMIN',
        } as any),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
