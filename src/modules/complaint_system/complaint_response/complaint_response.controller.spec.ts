import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseController } from './complaint_response.controller';
import { ComplaintResponseService } from './complaint_response.service';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findByComplaintId: jest.fn(),
  findAllWithRelations: jest.fn(),
};

const mockOfficerGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockJwtAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ComplaintResponseController', () => {
  let controller: ComplaintResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintResponseController],
      providers: [{ provide: ComplaintResponseService, useValue: mockService }],
    })
      .overrideGuard(OfficerGuard)
      .useValue(mockOfficerGuard)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<ComplaintResponseController>(ComplaintResponseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should create response with complaint and user injected into dto', async () => {
    const dto: any = { response_text: 'Work started' };
    const user: any = { sub: 51 };
    const created = { id: 1, complaint: { id: 9 }, user: { id: 51 }, response_text: 'Work started' };
    mockService.create.mockResolvedValue(created);

    const result = await controller.createResponse(9, dto, user);

    expect(result).toEqual(created);
    expect(dto.complaint).toEqual({ id: 9 });
    expect(dto.user).toEqual({ id: 51 });
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should return responses by complaint id', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockService.findByComplaintId.mockResolvedValue(rows);

    const result = await controller.findByComplaintId(7);

    expect(result).toEqual(rows);
    expect(mockService.findByComplaintId).toHaveBeenCalledWith(7);
  });

  // Test 4
  it('should return all complaint responses', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    mockService.findAllWithRelations.mockResolvedValue(rows);

    const result = await controller.findAll();

    expect(result).toEqual(rows);
    expect(mockService.findAllWithRelations).toHaveBeenCalledTimes(1);
  });
});
