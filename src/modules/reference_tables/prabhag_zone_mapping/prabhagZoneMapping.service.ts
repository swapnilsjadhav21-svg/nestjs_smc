import { BadRequestException, Injectable } from '@nestjs/common';
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
	override async create(dto: CreatePrabhagZoneMappingDto): Promise<PrabhagZoneMapping> {
		
		const existingMapping = await this.prabhagZoneMappingRepo.findOne({
			where: {
				prabhag:{ id: dto.prabhag.id},
				zone:{ id: dto.zone.id},
				is_deleted:false,
			}
		});

		if(existingMapping) {
			throw new BadRequestException( `Mapping for prabhag ${dto.prabhag.id} and zone ${dto.zone.id}, already exist `);
		}

		if(dto.is_primary) {
			await this.prabhagZoneMappingRepo.update(
				{ prabhag:{id:dto.prabhag.id},is_deleted:false },
				{ is_primary:false}
			);
		}

		const entity = this.prabhagZoneMappingRepo.create(dto);
		return this.prabhagZoneMappingRepo.save(entity);
	}
		
	async findAllWithRelation(): Promise<PrabhagZoneMapping[]> {
			return this.prabhagZoneMappingRepo.find({
				where:{ is_deleted:false},
				relations:['prabhag','zone']
			});
		}
};
