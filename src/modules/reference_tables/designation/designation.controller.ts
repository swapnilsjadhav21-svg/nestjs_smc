import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { Designation } from './entities/designation.entity';
import { DesignationService } from './designation.service';

@ApiTags('Reference - Designation')
@Controller('reference/designation')
export class DesignationController extends BaseCrudController<Designation, CreateDesignationDto> {
	constructor(private readonly designationService: DesignationService) {
		super(designationService);
	}

	@Post()
	@UseGuards(AdminGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Create Designation' })
	override create(@Body() dto: CreateDesignationDto): Promise<Designation> {
		return super.create(dto);
	}
}
