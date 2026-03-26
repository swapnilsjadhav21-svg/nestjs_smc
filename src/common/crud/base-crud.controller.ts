import { Body, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { BaseCrudService } from './base-crud.service';

export abstract class BaseCrudController<
  T extends { id: number },
  CreateDto extends DeepPartial<T>,
> {
  constructor(protected readonly service: BaseCrudService<T, CreateDto>) {}

  @Post()
  create(@Body() dto: CreateDto): Promise<T> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<T[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<T> {
    return this.service.findOne(id);
  }
}
