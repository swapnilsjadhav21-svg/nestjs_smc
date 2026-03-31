import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './entities/zone.entity';
import { CreateZoneDto } from './dto/create-zone.dto';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
@Injectable()
export class ZoneService extends BaseCrudService<Zone, CreateZoneDto> {

  constructor(
    @InjectRepository(Zone)
    private readonly zoneRepo: Repository<Zone>,
  ) {
    super(zoneRepo);
  }

  override async create(dto: CreateZoneDto): Promise<Zone> {
    const existing = await this.zoneRepo.findOne({
      where: { name: dto.name, is_deleted: false },
    });

    if (existing) {
      throw new ConflictException(`${dto.name} already exists`);
    }

    return super.create(dto);
  }
}
