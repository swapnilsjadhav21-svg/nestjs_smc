import { Module } from '@nestjs/common';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';
import { PrabhagZoneMappingController } from './prabhagZoneMapping.controller';

@Module({
  providers: [PrabhagZoneMappingService],
  controllers: [PrabhagZoneMappingController]
})
export class PrabhagZoneMappingModule {}
