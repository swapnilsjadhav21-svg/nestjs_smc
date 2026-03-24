import { Module } from '@nestjs/common';
import { AppCitizenService } from './app-citizen.service';
import { AppCitizenController } from './app-citizen.controller';

@Module({
  providers: [AppCitizenService],
  controllers: [AppCitizenController]
})
export class AppCitizenModule {}
