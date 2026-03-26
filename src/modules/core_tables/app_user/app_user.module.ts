import { Module } from '@nestjs/common';
import { AppUserService } from './app_user.service';
import { AppUserController } from './app_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from './entities/appUser.entity';
import { Designation } from '../../reference_tables/designation/entities/designation.entity';
import { Department } from '../../reference_tables/department/entities/department.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AppUser, Designation, Department])],
  providers: [AppUserService],
  controllers: [AppUserController]
})
export class AppUserModule {}
