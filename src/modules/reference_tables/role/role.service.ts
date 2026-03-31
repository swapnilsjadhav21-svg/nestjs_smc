import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService extends BaseCrudService<Role, CreateRoleDto> {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepo: Repository<Role>,
	) {
		super(roleRepo);
	}

	override async create(dto: CreateRoleDto): Promise<Role> {
		const existing = await this.roleRepo.findOne({
			where: { code: dto.code, is_deleted: false },
		});

		if (existing) {
			throw new ConflictException(`${dto.code} already exists`);
		}

		return super.create(dto);
	}
}
