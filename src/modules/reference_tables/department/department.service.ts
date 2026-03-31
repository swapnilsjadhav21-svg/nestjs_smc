import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentService extends BaseCrudService<Department, CreateDepartmentDto> {
	constructor(
		@InjectRepository(Department)
		private readonly departmentRepo: Repository<Department>,
	) {
		super(departmentRepo);
	}

	override async create(dto: CreateDepartmentDto): Promise<Department> {
		const existing = await this.departmentRepo.findOne({
			where: { name: dto.name, is_deleted: false },
		});

		if (existing) {
			throw new ConflictException(`${dto.name} already exists`);
		}

		return super.create(dto);
	}
}
