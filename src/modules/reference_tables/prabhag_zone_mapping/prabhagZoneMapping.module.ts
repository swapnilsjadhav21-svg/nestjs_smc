import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';
import { PrabhagZoneMappingController } from './prabhagZoneMapping.controller';
import { PrabhagZoneMapping } from './entities/prabhagZoneMapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PrabhagZoneMapping])],
  providers: [PrabhagZoneMappingService],
  controllers: [PrabhagZoneMappingController],
  exports: [PrabhagZoneMappingService],
})
export class PrabhagZoneMappingModule {}