import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DesignationController } from './designation.controller';
import { DesignationService } from './designation.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';

const mockService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('DesignationController', () => {
  let controller: DesignationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DesignationController],
      providers: [{ provide: DesignationService, useValue: mockService }],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<DesignationController>(DesignationController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should create designation successfully', async () => {
    const dto = { name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 };
    const created = { id: 1, ...dto };
    mockService.create.mockResolvedValue(created);

    const result = await controller.create(dto as any);

    expect(result).toEqual(created);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  // Test 3
  it('should throw ConflictException when code exists', async () => {
    mockService.create.mockRejectedValue(new ConflictException('JE already exists'));

    await expect(
      controller.create({ name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 } as any),
    ).rejects.toThrow(ConflictException);
  });

  // Test 4
  it('should throw BadRequestException for invalid hierarchy_level', async () => {
    mockService.create.mockRejectedValue(
      new BadRequestException('hierarchy_level must be greater than 0'),
    );

    await expect(
      controller.create({ name: 'Junior Engineer', code: 'JE', hierarchy_level: 0 } as any),
    ).rejects.toThrow(BadRequestException);
  });

  // Test 5
  it('should return all designations', async () => {
    const list = [
      { id: 1, name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 },
      { id: 2, name: 'Senior Engineer', code: 'SE', hierarchy_level: 2 },
    ];
    mockService.findAll.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toEqual(list);
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });
});
