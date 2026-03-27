// app-user-role.controller.ts
import { Body, Controller, Delete, Get, 
         Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { AppUserRole } from './entities/appUserRole.entity';
import { CreateAppUserRoleDto } from './dto/create-app-user-role.dto';
import { AppUserRoleService } from './app_user_role.service';

@ApiTags('Core - App User Role')
@Controller('user-role')
export class AppUserRoleController extends BaseCrudController<AppUserRole, CreateAppUserRoleDto> {
  constructor(private readonly appUserRoleService: AppUserRoleService) {
    super(appUserRoleService);
  }

  @Post()
  @ApiOperation({ summary: 'Assign a role to a user' })
  override create(@Body() dto: CreateAppUserRoleDto): Promise<AppUserRole> {
    return super.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user role mappings' })
  override findAll(): Promise<AppUserRole[]> {
    return this.appUserRoleService.findAllWithRelations();
  }

  // This route MUST be before :id route — otherwise NestJS will
  // treat "user" as an id param and ParseIntPipe will throw an error
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all roles for a specific user' })
  findRolesByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<AppUserRole[]> {
    return this.appUserRoleService.findRolesByUserId(userId);
  }

}