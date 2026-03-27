import { Module } from '@nestjs/common';
import { AppUserService } from './app_user.service';
import { AppUserController } from './app_user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppUser } from './entities/appUser.entity';

@Module({
  imports:[TypeOrmModule.forFeature([AppUser])],
  providers: [AppUserService],
  controllers: [AppUserController],
  exports:[AppUserService],
})
export class AppUserModule {}
