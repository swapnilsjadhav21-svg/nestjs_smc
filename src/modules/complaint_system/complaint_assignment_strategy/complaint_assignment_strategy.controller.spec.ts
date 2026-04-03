import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintAssignmentStrategyController } from './complaint_assignment_strategy.controller';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('ComplaintAssignmentStrategyController', () => {
  let controller: ComplaintAssignmentStrategyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintAssignmentStrategyController],
      providers: [{ provide: ComplaintAssignmentStrategyService, useValue: mockService }],
    }).compile();

    controller = module.get<ComplaintAssignmentStrategyController>(ComplaintAssignmentStrategyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Test 2
  it('should return all strategies', async () => {
    const list = [
      { id: 1, code: 'ZONE' },
      { id: 2, code: 'DEPARTMENT' },
    ];
    mockService.findAll.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toEqual(list);
    expect(mockService.findAll).toHaveBeenCalledTimes(1);
  });

  // Test 3
  it('should return empty array when no strategies', async () => {
    mockService.findAll.mockResolvedValue([]);

    const result = await controller.findAll();

    expect(result).toEqual([]);
  });
});
