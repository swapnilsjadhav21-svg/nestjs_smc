import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseMediaService } from './complaint_response_media.service';

describe('ComplaintResponseMediaService', () => {
  let service: ComplaintResponseMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintResponseMediaService],
    }).compile();

    service = module.get<ComplaintResponseMediaService>(ComplaintResponseMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
