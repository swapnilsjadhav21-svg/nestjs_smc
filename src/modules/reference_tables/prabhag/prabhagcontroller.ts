import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreatePrabhagDto } from './dto/create-prabhag.dto';
import { Prabhag } from './entities/prabhag.entity';
import { PrabhagService } from './prabhag.service';

@ApiTags('Reference - Prabhag')
@Controller('reference/prabhag')
export class PrabhagController extends BaseCrudController<Prabhag, CreatePrabhagDto> {
	constructor(private readonly prabhagService: PrabhagService) {
		super(prabhagService);
	}

	@Post()
	@ApiOperation({ summary: 'Create Prabhag' })
	override create(@Body() dto: CreatePrabhagDto): Promise<Prabhag> {
		return super.create(dto);
	}
}
