import { Test, TestingModule } from '@nestjs/testing';
import { PrabhagZoneMappingController } from './prabhag_zone_mapping.controller';

describe('PrabhagZoneMappingController', () => {
  let controller: PrabhagZoneMappingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrabhagZoneMappingController],
    }).compile();

    controller = module.get<PrabhagZoneMappingController>(PrabhagZoneMappingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
