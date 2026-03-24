import { Test, TestingModule } from '@nestjs/testing';
import { PrabhagController } from './prabhagcontroller';

describe('PrabhagController', () => {
  let controller: PrabhagController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrabhagController],
    }).compile();

    controller = module.get<PrabhagController>(PrabhagController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
