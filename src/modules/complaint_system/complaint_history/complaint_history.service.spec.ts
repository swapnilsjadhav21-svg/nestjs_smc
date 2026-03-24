import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintHistoryService } from './complaint_history.service';

describe('ComplaintHistoryService', () => {
  let service: ComplaintHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintHistoryService],
    }).compile();

    service = module.get<ComplaintHistoryService>(ComplaintHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
