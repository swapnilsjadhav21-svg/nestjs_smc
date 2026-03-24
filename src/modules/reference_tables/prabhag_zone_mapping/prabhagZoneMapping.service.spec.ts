import { Test, TestingModule } from '@nestjs/testing';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';

describe('PrabhagZoneMappingService', () => {
  let service: PrabhagZoneMappingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrabhagZoneMappingService],
    }).compile();

    service = module.get<PrabhagZoneMappingService>(PrabhagZoneMappingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
