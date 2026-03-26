import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZoneService } from './zone.service';
import { CreateZoneDto } from './dto/create-zone.dto';
import { Zone } from './entities/zone.entity';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';

@ApiTags('Reference - Zone')
@Controller('reference/zone')
export class ZoneController extends BaseCrudController<Zone, CreateZoneDto> {
  constructor(private readonly zoneService: ZoneService) {
    super(zoneService);
  }

  @Post()
  @ApiOperation({ summary: 'Create Zone' })
  override create(@Body() dto: CreateZoneDto): Promise<Zone> {
    return super.create(dto);
  }
}