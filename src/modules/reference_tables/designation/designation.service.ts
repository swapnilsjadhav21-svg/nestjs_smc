import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { Designation } from './entities/designation.entity';

@Injectable()
export class DesignationService extends BaseCrudService<Designation, CreateDesignationDto> {
	constructor(
		@InjectRepository(Designation)
		private readonly designationRepo: Repository<Designation>,
	) {
		super(designationRepo);
	}

	override async create(dto: CreateDesignationDto): Promise<Designation> {
		if (dto.hierarchy_level <= 0) {
			throw new BadRequestException('hierarchy_level must be greater than 0');
		}

		const existing = await this.designationRepo.findOne({
			where: { code: dto.code, is_deleted: false },
		});

		if (existing) {
			throw new ConflictException(`${dto.code} already exists`);
		}

		return super.create(dto);
	}
}
