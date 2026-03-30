import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateRoleDto } from './dto/create-role.dto';
import { Role } from './entities/role.entity';
import { RoleService } from './role.service';

@ApiTags('Reference - Role')
@Controller('reference/role')
export class RoleController extends BaseCrudController<Role, CreateRoleDto> {
	constructor(private readonly roleService: RoleService) {
		super(roleService);
	}

	@Post()
	@UseGuards(AdminGuard)
	@ApiBearerAuth('JWT-auth')
	@ApiOperation({ summary: 'Create Role' })
	override create(@Body() dto: CreateRoleDto): Promise<Role> {
		return super.create(dto);
	}
}
