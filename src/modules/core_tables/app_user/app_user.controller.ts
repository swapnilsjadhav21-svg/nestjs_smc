import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AppUser } from './entities/appUser.entity';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto, UpdateUserStatusDto } from './dto/update-app-user.dto';
import { AppUserService } from './app_user.service';

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
  @ApiOperation({ summary: 'Get users with filters and pagination' })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'designation_id', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  findWithFilters(
    @Query('department_id') department_id?: number,
    @Query('designation_id') designation_id?: number,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
  ) {
    return this.appUserService.findWithFilters({
      department_id: department_id ? Number(department_id) : undefined,
      designation_id: designation_id ? Number(designation_id) : undefined,
      page: page ? Number(page) : 1,
      page_size: page_size ? Number(page_size) : 50,
    });
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

// ```

// ---

// **Test on Swagger:**
// ```
// GET /user                              → all users, default pagination
// GET /user?page=1&page_size=2           → 2 users per page
// GET /user?department_id=1             → only users in department 1
// GET /user?designation_id=2&page=1     → users with designation 2
// GET /user?department_id=1&page=2&page_size=2  → combined filter + pagination