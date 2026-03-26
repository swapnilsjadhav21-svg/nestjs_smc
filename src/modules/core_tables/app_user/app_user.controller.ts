import { Controller, Post, Body } from '@nestjs/common';
import { CreateAppUserDto } from './dto/appUser.dto';
import { AppUserService } from './app_user.service';

import { Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('app-user')
export class AppUserController {

  constructor(
    private readonly appUserService: AppUserService, // ✅ FIX
  ) {}

  @Post()
  create(@Body() dto: CreateAppUserDto) {
    return this.appUserService.createAppUser(dto);
  }

  @Get()
    findAll() {
    return this.appUserService.findAll();
  }

    @Get(':id')
        findOne(@Param('id', ParseIntPipe) id: number) {
        return this.appUserService.findOne(id);
    }
}