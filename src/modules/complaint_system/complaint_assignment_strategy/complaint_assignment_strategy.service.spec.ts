import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';
import { ComplaintAssignmentStrategy } from './entities/complaint_assignment_strategy.entity';

const mockRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
};

describe('ComplaintAssignmentStrategyService', () => {
  let service: ComplaintAssignmentStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComplaintAssignmentStrategyService,
        {
          provide: getRepositoryToken(ComplaintAssignmentStrategy),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ComplaintAssignmentStrategyService>(ComplaintAssignmentStrategyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test 2
  it('should return all strategies', async () => {
    const list = [
      { id: 1, code: 'ZONE' },
      { id: 2, code: 'DEPARTMENT' },
    ];
    mockRepository.find.mockResolvedValue(list);

    const result = await service.findAll();

    expect(result).toEqual(list);
    expect(mockRepository.find).toHaveBeenCalledTimes(1);
  });

  // Test 3
  it('should return empty array when no strategies exist', async () => {
    mockRepository.find.mockResolvedValue([]);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });
});
