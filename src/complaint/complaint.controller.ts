import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { Complaints } from './complaint.model';

@Controller('complaints')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Get()
  async findAll() {
    return await this.complaintService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.complaintService.findOne(id);
  }

  @Post()
  async create(@Body() complaint: Partial<Complaints>) {
    return await this.complaintService.create(complaint);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() complaint: Partial<Complaints>) {
    return await this.complaintService.update(id, complaint);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.complaintService.delete(id);
  }
}
