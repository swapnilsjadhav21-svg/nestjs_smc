import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';

describe('ComplaintAssignmentStrategyService', () => {
  let service: ComplaintAssignmentStrategyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintAssignmentStrategyService],
    }).compile();

    service = module.get<ComplaintAssignmentStrategyService>(ComplaintAssignmentStrategyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
