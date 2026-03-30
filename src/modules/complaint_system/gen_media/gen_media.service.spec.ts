import { Test, TestingModule } from '@nestjs/testing';
import { GenMediaService } from './gen_media.service';

describe('GenMediaService', () => {
  let service: GenMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenMediaService],
    }).compile();

    service = module.get<GenMediaService>(GenMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
