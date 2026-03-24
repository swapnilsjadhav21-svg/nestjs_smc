import { Test, TestingModule } from '@nestjs/testing';
import { ComplaintMediaController } from './complaint_media.controller';

describe('ComplaintMediaController', () => {
  let controller: ComplaintMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComplaintMediaController],
    }).compile();

    controller = module.get<ComplaintMediaController>(ComplaintMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
