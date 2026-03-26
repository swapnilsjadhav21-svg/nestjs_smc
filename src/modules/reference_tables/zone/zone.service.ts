import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
@Injectable()
export class ZoneService extends BaseCrudService<Zone> {

  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
  ) {
    super(zoneRepo);
  }
}
