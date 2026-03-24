import { Test, TestingModule } from '@nestjs/testing';
import { PrabhagService } from './prabhag.service';

describe('PrabhagService', () => {
  let service: PrabhagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrabhagService],
    }).compile();

    service = module.get<PrabhagService>(PrabhagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
