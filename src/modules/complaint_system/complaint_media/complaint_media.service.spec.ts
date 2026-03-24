import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintMediaService } from './complaint_media.service';

describe('ComplaintMediaService', () => {
  let service: ComplaintMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ComplaintMediaService],
    }).compile();

    service = module.get<ComplaintMediaService>(ComplaintMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
