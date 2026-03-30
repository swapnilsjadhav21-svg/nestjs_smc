import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
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
	@UseGuards(AdminGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Create Prabhag' })
	override create(@Body() dto: CreatePrabhagDto): Promise<Prabhag> {
		return super.create(dto);
	}
}
