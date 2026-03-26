import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';
import { DepartmentService } from './department.service';

@ApiTags('Reference - Department')
@Controller('reference/department')
export class DepartmentController extends BaseCrudController<Department> {
	constructor(private readonly departmentService: DepartmentService) {
		super(departmentService);
	}

	@Post()
	@ApiOperation({ summary: 'Create Department' })
	override create(@Body() dto: CreateDepartmentDto): Promise<Department> {
		return super.create(dto);
	}
}
