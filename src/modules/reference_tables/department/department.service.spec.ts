import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';

// Mock repository — fake DB, no real DB connection needed
const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('DepartmentService', () => {
  let service: DepartmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        {
          provide: getRepositoryToken(Department),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
  });

  // Reset all mocks before each test so previous test results don't bleed in
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Test 1 — service is created successfully
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ✅ Test 2 — create department successfully
  it('should create a department when name does not exist', async () => {
    const dto = { name: 'Water Department' };
    const savedDepartment = { id: 1, name: 'Water Department', is_deleted: false };

    // Simulate: no existing department found
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(savedDepartment);
    mockRepository.save.mockResolvedValue(savedDepartment);

    const result = await service.create(dto);

    expect(result).toEqual(savedDepartment);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  // ✅ Test 3 — throw ConflictException when department already exists
  it('should throw ConflictException when department name already exists', async () => {
    const dto = { name: 'Water Department' };
    const existingDepartment = { id: 1, name: 'Water Department', is_deleted: false };

    // Simulate: existing department found
    mockRepository.findOne.mockResolvedValue(existingDepartment);

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
    await expect(service.create(dto)).rejects.toThrow('Water Department already exists');
  });

  // ✅ Test 4 — findAll returns list
  it('should return all departments', async () => {
    const departments = [
      { id: 1, name: 'Water Department' },
      { id: 2, name: 'Health Department' },
    ];

    mockRepository.find.mockResolvedValue(departments);

    const result = await service.findAll();

    expect(result).toEqual(departments);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });
});