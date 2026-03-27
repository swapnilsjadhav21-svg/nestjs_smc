import { Module } from '@nestjs/common';
import { AppUserRoleService } from './app_user_role.service';
import { AppUserRoleController } from './app_user_role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUserRole } from './entities/appUserRole.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppUserRole])],
  providers: [AppUserRoleService],
  controllers: [AppUserRoleController]
})
export class AppUserRoleModule {}
