import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintAssignmentStrategyController } from './complaint_assignment_strategy.controller';

describe('ComplaintAssignmentStrategyController', () => {
  let controller: ComplaintAssignmentStrategyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintAssignmentStrategyController],
    }).compile();

    controller = module.get<ComplaintAssignmentStrategyController>(ComplaintAssignmentStrategyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
