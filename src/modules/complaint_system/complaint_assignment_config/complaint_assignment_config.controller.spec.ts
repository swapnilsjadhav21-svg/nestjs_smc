import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintAssignmentConfigController } from './complaint_assignment_config.controller';

describe('ComplaintAssignmentConfigController', () => {
  let controller: ComplaintAssignmentConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintAssignmentConfigController],
    }).compile();

    controller = module.get<ComplaintAssignmentConfigController>(ComplaintAssignmentConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
