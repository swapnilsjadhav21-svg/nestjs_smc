import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { ComplaintAssignmentConfigController } from './complaint_assignment_config.controller';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findAllWithRelations: jest.fn(),
  findOne: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ComplaintAssignmentConfigController', () => {
  let controller: ComplaintAssignmentConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintAssignmentConfigController],
      providers: [{ provide: ComplaintAssignmentConfigService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<ComplaintAssignmentConfigController>(ComplaintAssignmentConfigController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should create config successfully', async () => {
    const dto = {
      complaint_type: { id: 1 },
      strategy: { id: 1 },
      designation: { id: 1 },
      department: { id: 1 },
    };
    const created = { id: 1, ...dto };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(dto as any);

    expect(result).toEqual(created);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should throw ConflictException when config exists', async () => {
    mockService.create.mockRejectedValue(
      new ConflictException('Assignment config for this complaint type already exists'),
    );

    await expect(
      controller.create({ complaint_type: { id: 1 }, strategy: { id: 1 } } as any),
    ).rejects.toThrow(ConflictException);
  });

  // Test 4
  it('should return all configs with relations', async () => {
    const list = [
      { id: 1, complaint_type: { id: 1 }, strategy: { id: 1 } },
      { id: 2, complaint_type: { id: 2 }, strategy: { id: 2 } },
    ];
    mockService.findAllWithRelations.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toEqual(list);
    expect(mockService.findAllWithRelations).toHaveBeenCalledTimes(1);
  });
});
