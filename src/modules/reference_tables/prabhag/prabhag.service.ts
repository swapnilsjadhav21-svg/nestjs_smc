import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreatePrabhagDto } from './dto/create-prabhag.dto';
import { Prabhag } from './entities/prabhag.entity';

@Injectable()
export class PrabhagService extends BaseCrudService<Prabhag, CreatePrabhagDto> {
	constructor(
		@InjectRepository(Prabhag)
		private readonly prabhagRepo: Repository<Prabhag>,
	) {
		super(prabhagRepo);
	}

	override async create(dto: CreatePrabhagDto): Promise<Prabhag> {
		const existing = await this.prabhagRepo.findOne({
			where: { name: dto.name, is_deleted: false },
		});

		if (existing) {
			throw new ConflictException(`${dto.name} already exists`);
		}

		return super.create(dto);
	}
}
