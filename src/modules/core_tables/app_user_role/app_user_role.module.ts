import { Module } from '@nestjs/common';
import { AppUserRoleService } from './app_user_role.service';
import { AppUserRoleController } from './app_user_role.controller';

@Module({
  providers: [AppUserRoleService],
  controllers: [AppUserRoleController]
})
export class AppUserRoleModule {}
