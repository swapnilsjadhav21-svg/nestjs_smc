import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintResponseMediaController } from './complaint_response_media.controller';

describe('ComplaintResponseMediaController', () => {
  let controller: ComplaintResponseMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintResponseMediaController],
    }).compile();

    controller = module.get<ComplaintResponseMediaController>(ComplaintResponseMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
