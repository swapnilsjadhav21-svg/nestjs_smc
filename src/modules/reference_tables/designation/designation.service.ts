import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { Designation } from './entities/designation.entity';

@Injectable()
export class DesignationService extends BaseCrudService<Designation> {
	constructor(
		@InjectRepository(Designation)
		private readonly designationRepo: Repository<Designation>,
	) {
		super(designationRepo);
	}
}
