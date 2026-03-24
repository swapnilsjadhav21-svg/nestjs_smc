import { Test, TestingModule } from '@nestjs/testing';
import { AppUserRoleController } from './app_user_role.controller';

describe('AppUserRoleController', () => {
  let controller: AppUserRoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppUserRoleController],
    }).compile();

    controller = module.get<AppUserRoleController>(AppUserRoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
