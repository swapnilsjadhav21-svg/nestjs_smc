import { Module } from '@nestjs/common';
import { AppCitizenService } from './app-citizen.service';
import { AppCitizenController } from './app-citizen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppCitizen } from './entities/appCitizen.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AppCitizen])],
  providers: [AppCitizenService],
  controllers: [AppCitizenController]
})
export class AppCitizenModule {}