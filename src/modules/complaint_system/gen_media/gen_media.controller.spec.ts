import { Test, TestingModule } from '@nestjs/testing';
import { GenMediaController } from './gen_media.controller';
import { GenMediaService } from './gen_media.service';

describe('GenMediaController', () => {
  let controller: GenMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenMediaController],
      providers: [GenMediaService],
    }).compile();

    controller = module.get<GenMediaController>(GenMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
