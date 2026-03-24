import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';

describe('ComplaintAssignmentConfigService', () => {
  let service: ComplaintAssignmentConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintAssignmentConfigService],
    }).compile();

    service = module.get<ComplaintAssignmentConfigService>(ComplaintAssignmentConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
