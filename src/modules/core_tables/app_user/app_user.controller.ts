// app-user.controller.ts
import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AppUser } from './entities/appUser.entity';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto, UpdateUserStatusDto } from './dto/update-app-user.dto';
import { AppUserService } from './app_user.service';
import { UseGuards } from '@nestjs/common';

@ApiTags('Core - App User')
@ApiBearerAuth('JWT-auth')
@UseGuards(AdminGuard)
@Controller('user')
export class AppUserController extends BaseCrudController<AppUser, CreateAppUserDto> {
  constructor(private readonly appUserService: AppUserService) {
    super(appUserService);
  }

  @Post()
  @ApiOperation({ summary: 'Create new officer/user' })
  override create(@Body() dto: CreateAppUserDto): Promise<AppUser> {
    return super.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with relations' })
  override findAll(): Promise<AppUser[]> {
    return this.appUserService.findAllWithRelations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  override findOne(@Param('id', ParseIntPipe) id: number): Promise<AppUser> {
    return this.appUserService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user info' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppUserDto,
  ): Promise<AppUser> {
    return this.appUserService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate user' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserStatusDto,
  ): Promise<AppUser> {
    return this.appUserService.updateStatus(id, dto);
  }
}