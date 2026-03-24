import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintTypeController } from './complaint_type.controller';

describe('ComplaintTypeController', () => {
  let controller: ComplaintTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintTypeController],
    }).compile();

    controller = module.get<ComplaintTypeController>(ComplaintTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
