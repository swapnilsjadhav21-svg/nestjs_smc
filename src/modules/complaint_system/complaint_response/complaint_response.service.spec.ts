import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseService } from './complaint_response.service';

describe('ComplaintResponseService', () => {
  let service: ComplaintResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintResponseService],
    }).compile();

    service = module.get<ComplaintResponseService>(ComplaintResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
