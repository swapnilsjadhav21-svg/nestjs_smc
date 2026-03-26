// prabhag-zone-mapping.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { PrabhagZoneMapping } from './entities/prabhagZoneMapping.entity';
import { CreatePrabhagZoneMappingDto } from './dto/create-prabhag-zone-mapping.dto';

@Injectable()
export class PrabhagZoneMappingService extends BaseCrudService<
  PrabhagZoneMapping,
  CreatePrabhagZoneMappingDto
> {
  constructor(
    @InjectRepository(PrabhagZoneMapping)
    private readonly prabhagZoneMappingRepo: Repository<PrabhagZoneMapping>,
  ) {
    super(prabhagZoneMappingRepo);
  }

  // Overriding base create() because we need extra validation
  override async create(dto: CreatePrabhagZoneMappingDto): Promise<PrabhagZoneMapping> {

    // Check if this prabhag-zone combination already exists
    const existingMapping = await this.prabhagZoneMappingRepo.findOne({
      where: {
        prabhag: { id: dto.prabhag.id },
        zone: { id: dto.zone.id },
        is_deleted: false,
      },
    });

    if (existingMapping) {
      throw new BadRequestException(
        `Mapping for prabhag ${dto.prabhag.id} and zone ${dto.zone.id} already exists`,
      );
    }

    // If this mapping is being set as primary,
    // remove primary from any existing mapping for this prabhag
    if (dto.is_primary) {
      await this.prabhagZoneMappingRepo.update(
        { prabhag: { id: dto.prabhag.id }, is_deleted: false },
        { is_primary: false },
      );
    }

    // Now create and save — TypeORM understands { id: 1 } and links it correctly
    const entity = this.prabhagZoneMappingRepo.create(dto);
    return this.prabhagZoneMappingRepo.save(entity);
  }

  // Custom findAll that returns prabhag and zone details, not just IDs
  async findAllWithRelations(): Promise<PrabhagZoneMapping[]> {
    return this.prabhagZoneMappingRepo.find({
      where: { is_deleted: false },
      relations: ['prabhag', 'zone'],  // tells TypeORM to JOIN and fetch full objects
    });
  }
}