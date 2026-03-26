import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentService extends BaseCrudService<Department> {
	constructor(
		@InjectRepository(Department)
		private readonly departmentRepo: Repository<Department>,
	) {
		super(departmentRepo);
	}
}
