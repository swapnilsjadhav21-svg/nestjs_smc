import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseController } from './complaint_response.controller';

describe('ComplaintResponseController', () => {
  let controller: ComplaintResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintResponseController],
    }).compile();

    controller = module.get<ComplaintResponseController>(ComplaintResponseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
