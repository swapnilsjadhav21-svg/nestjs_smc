import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';

@Injectable()
export class RoleService extends BaseCrudService<Role> {
	constructor(
		@InjectRepository(Role)
		private readonly roleRepo: Repository<Role>,
	) {
		super(roleRepo);
	}
}
