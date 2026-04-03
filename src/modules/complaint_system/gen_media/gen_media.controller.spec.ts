import { Test, TestingModule } from '@nestjs/testing';
import { GenMediaController } from './gen_media.controller';
import { GenMediaService } from './gen_media.service';

const mockService = {
  upload: jest.fn(),
  findOne: jest.fn(),
};

describe('GenMediaController', () => {
  let controller: GenMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenMediaController],
      providers: [{ provide: GenMediaService, useValue: mockService }],
    }).compile();

    controller = module.get<GenMediaController>(GenMediaController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});