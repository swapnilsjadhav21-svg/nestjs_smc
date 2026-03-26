import { Body, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { BaseCrudService } from './base-crud.service';

export abstract class BaseCrudController<T extends { id: number }> {
  constructor(protected readonly service: BaseCrudService<T>) {}

  @Post()
  create(@Body() dto: any): Promise<T> {
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
