import { Test, TestingModule } from '@nestjs/testing';
import { AppUserRoleService } from './app_user_role.service';

describe('AppUserRoleService', () => {
  let service: AppUserRoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppUserRoleService],
    }).compile();

    service = module.get<AppUserRoleService>(AppUserRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
