import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DesignationService } from './designation.service';
import { Designation } from './entities/designation.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('DesignationService', () => {
  let service: DesignationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignationService,
        { provide: getRepositoryToken(Designation), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DesignationService>(DesignationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create designation when code does not exist', async () => {
    const dto = { name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 };
    const created = { id: 1, ...dto };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  // Test 3
  it('should throw ConflictException when code already exists', async () => {
    const dto = { name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 };
    mockRepository.findOne.mockResolvedValue({ id: 9, ...dto });

    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    await expect(service.create(dto as any)).rejects.toThrow('JE already exists');
  });

  // Test 4
  it('should throw BadRequestException when hierarchy_level is 0', async () => {
    const dto = { name: 'Junior Engineer', code: 'JE', hierarchy_level: 0 };
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto as any)).rejects.toThrow(
      'hierarchy_level must be greater than 0',
    );
  });

  // Test 5
  it('should throw BadRequestException when hierarchy_level is negative', async () => {
    const dto = { name: 'Junior Engineer', code: 'JE', hierarchy_level: -1 };
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.create(dto as any)).rejects.toThrow(BadRequestException);
  });

  // Test 6
  it('should return all designations', async () => {
    const list = [
      { id: 1, name: 'Junior Engineer', code: 'JE', hierarchy_level: 4 },
      { id: 2, name: 'Senior Engineer', code: 'SE', hierarchy_level: 2 },
    ];
    mockRepository.find.mockResolvedValue(list);

    const result = await service.findAll();

    expect(result).toEqual(list);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });
});
