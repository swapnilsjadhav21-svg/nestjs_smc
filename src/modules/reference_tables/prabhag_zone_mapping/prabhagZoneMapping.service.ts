import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreatePrabhagZoneMappingDto } from './dto/create-prabhag-zone-mapping.dto';
import { PrabhagZoneMapping } from './entities/prabhagZoneMapping.entity';

@Injectable()
export class PrabhagZoneMappingService extends BaseCrudService<PrabhagZoneMapping, CreatePrabhagZoneMappingDto> {
	constructor(
		@InjectRepository(PrabhagZoneMapping)
		private readonly prabhagZoneMappingRepo: Repository<PrabhagZoneMapping>,
	) {
		super(prabhagZoneMappingRepo);
	}
}
