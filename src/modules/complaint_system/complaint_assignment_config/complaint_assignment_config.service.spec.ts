import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException } from '@nestjs/common';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';
import { ComplaintAssignmentConfig } from './entities/complaint_assignment_config.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('ComplaintAssignmentConfigService', () => {
  let service: ComplaintAssignmentConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintAssignmentConfigService,
        {
          provide: getRepositoryToken(ComplaintAssignmentConfig),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ComplaintAssignmentConfigService>(ComplaintAssignmentConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should create config when complaint type has no existing config', async () => {
    const dto = {
      complaint_type: { id: 1 },
      strategy: { id: 1 },
      designation: { id: 1 },
      department: { id: 1 },
    };
    const created = { id: 1, ...dto };

    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.create.mockReturnValue(created);
    mockRepository.save.mockResolvedValue(created);

    const result = await service.create(dto as any);

    expect(result).toEqual(created);
    expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
  });

  // Test 3
  it('should throw ConflictException when config exists for complaint type', async () => {
    const dto = { complaint_type: { id: 1 }, strategy: { id: 1 } };
    mockRepository.findOne.mockResolvedValue({ id: 11, ...dto });

    await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    await expect(service.create(dto as any)).rejects.toThrow(
      'Assignment config for this complaint type already exists',
    );
  });

  // Test 4
  it('should return all configs', async () => {
    const list = [
      { id: 1, complaint_type: { id: 1 }, strategy: { id: 1 } },
      { id: 2, complaint_type: { id: 2 }, strategy: { id: 2 } },
    ];
    mockRepository.find.mockResolvedValue(list);

    const result = await service.findAll();

    expect(result).toEqual(list);
  });
});
