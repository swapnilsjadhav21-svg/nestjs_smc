import { Module } from '@nestjs/common';
import { PrabhagZoneMappingService } from './prabhag_zone_mapping.service';
import { PrabhagZoneMappingController } from './prabhag_zone_mapping.controller';

@Module({
  providers: [PrabhagZoneMappingService],
  controllers: [PrabhagZoneMappingController]
})
export class PrabhagZoneMappingModule {}
