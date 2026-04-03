import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { ComplaintTypeController } from './complaint_type.controller';
import { ComplaintTypeService } from './complaint_type.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ComplaintTypeController', () => {
  let controller: ComplaintTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintTypeController],
      providers: [{ provide: ComplaintTypeService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<ComplaintTypeController>(ComplaintTypeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should create complaint type successfully', async () => {
    const dto = { name: 'Water Leakage' };
    const created = { id: 1, ...dto };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(dto as any);

    expect(result).toEqual(created);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should throw ConflictException when complaint type already exists', async () => {
    mockService.create.mockRejectedValue(new ConflictException('Water Leakage already exists'));

    await expect(controller.create({ name: 'Water Leakage' } as any)).rejects.toThrow(
      ConflictException,
    );
  });

  // Test 4
  it('should return all complaint types', async () => {
    const list = [
      { id: 1, name: 'Water Leakage' },
      { id: 2, name: 'Garbage Collection' },
    ];
    mockService.findAll.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toEqual(list);
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });
});
