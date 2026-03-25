import { Body, Get, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { BaseCrudService } from './base-crud.service';

export abstract class BaseCrudController<
  T extends object,
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
}
