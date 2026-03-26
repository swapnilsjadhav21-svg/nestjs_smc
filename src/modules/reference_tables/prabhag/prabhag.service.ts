import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreatePrabhagDto } from './dto/create-prabhag.dto';
import { Prabhag } from './entities/prabhag.entity';

@Injectable()
export class PrabhagService extends BaseCrudService<Prabhag> {
	constructor(
		@InjectRepository(Prabhag)
		private readonly prabhagRepo: Repository<Prabhag>,
	) {
		super(prabhagRepo);
	}
}
