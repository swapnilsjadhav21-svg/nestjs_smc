import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentController } from './department.controller';
import { DepartmentService } from './department.service';
import { ConflictException } from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';

// Mock the entire service — controller tests should not test service logic
const mockDepartmentService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
};

// Mock AdminGuard — we don't want auth to block controller tests
const mockAdminGuard = {
  canActivate: jest.fn().mockReturnValue(true), // always allow in tests
};

describe('DepartmentController', () => {
  let controller: DepartmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentController],
      providers: [
        {
          provide: DepartmentService,
          useValue: mockDepartmentService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<DepartmentController>(DepartmentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Test 1 — controller is created successfully
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ✅ Test 2 — create calls service and returns result
  it('should create a department', async () => {
    const dto = { name: 'Water Department' };
    const created = { id: 1, name: 'Water Department', is_deleted: false };

    mockDepartmentService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(result).toEqual(created);
    expect(mockDepartmentService.create).toHaveBeenCalledWith(dto);
    expect(mockDepartmentService.create).toHaveBeenCalledTimes(1);
  });

  // ✅ Test 3 — create throws when service throws ConflictException
  it('should throw ConflictException when department already exists', async () => {
    const dto = { name: 'Water Department' };

    mockDepartmentService.create.mockRejectedValue(
      new ConflictException('Water Department already exists'),
    );

    await expect(controller.create(dto)).rejects.toThrow(ConflictException);
  });

  // ✅ Test 4 — findAll returns list
  it('should return all departments', async () => {
    const departments = [
      { id: 1, name: 'Water Department' },
      { id: 2, name: 'Health Department' },
    ];

    mockDepartmentService.findAll.mockResolvedValue(departments);

    const result = await controller.findAll();

    expect(result).toEqual(departments);
    expect(mockDepartmentService.findAll).toHaveBeenCalledTimes(1);
  });
});