import { Test, TestingModule } from '@nestjs/testing';
import { AppUserController } from './app_user.controller';

describe('AppUserController', () => {
  let controller: AppUserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUserController],
    }).compile();

    controller = module.get<AppUserController>(AppUserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
