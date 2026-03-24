import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintHistoryController } from './complaint_history.controller';

describe('ComplaintHistoryController', () => {
  let controller: ComplaintHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintHistoryController],
    }).compile();

    controller = module.get<ComplaintHistoryController>(ComplaintHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
