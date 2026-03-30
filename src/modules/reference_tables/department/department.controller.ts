import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';

@ApiTags('Reference - Department')
@Controller('reference/department')
export class DepartmentController extends BaseCrudController<Department, CreateDepartmentDto> {
	constructor(private readonly departmentService: DepartmentService) {
		super(departmentService);
	}

	@Post()
	@UseGuards(AdminGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Create Department' })
	override create(@Body() dto: CreateDepartmentDto): Promise<Department> {
		return super.create(dto);
	}
}
