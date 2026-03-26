import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { Designation } from './entities/designation.entity';
import { DesignationService } from './designation.service';

@ApiTags('Reference - Designation')
@Controller('reference/designation')
export class DesignationController extends BaseCrudController<Designation> {
	constructor(private readonly designationService: DesignationService) {
		super(designationService);
	}

	@Post()
	@ApiOperation({ summary: 'Create Designation' })
	override create(@Body() dto: CreateDesignationDto): Promise<Designation> {
		return super.create(dto);
	}
}
