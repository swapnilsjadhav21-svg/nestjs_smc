import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintTypeService } from './complaint_type.service';

describe('ComplaintTypeService', () => {
  let service: ComplaintTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintTypeService],
    }).compile();

    service = module.get<ComplaintTypeService>(ComplaintTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
