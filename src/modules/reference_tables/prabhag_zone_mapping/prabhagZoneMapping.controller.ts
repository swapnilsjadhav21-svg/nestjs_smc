import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreatePrabhagZoneMappingDto } from './dto/create-prabhag-zone-mapping.dto';
import { PrabhagZoneMapping } from './entities/prabhagZoneMapping.entity';
import { PrabhagZoneMappingService } from './prabhagZoneMapping.service';

@ApiTags('Reference - Prabhag Zone Mapping')
@Controller('reference/prabhag-zone-mapping')
export class PrabhagZoneMappingController extends BaseCrudController<
	PrabhagZoneMapping,
	CreatePrabhagZoneMappingDto
> {
	constructor(private readonly prabhagZoneMappingService: PrabhagZoneMappingService) {
		super(prabhagZoneMappingService);
	}

	@Post()
	@ApiOperation({ summary: 'Create Prabhag Zone Mapping' })
	override create(@Body() dto: CreatePrabhagZoneMappingDto): Promise<PrabhagZoneMapping> {
		return super.create(dto);
	}
}
