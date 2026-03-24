import { Test, TestingModule } from '@nestjs/testing';
import { AppCitizenController } from './app-citizen.controller';

describe('AppCitizenController', () => {
  let controller: AppCitizenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppCitizenController],
    }).compile();

    controller = module.get<AppCitizenController>(AppCitizenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
