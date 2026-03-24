import { Module } from '@nestjs/common';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {Complaints } from './complaint.model';
import { DepartmentModule } from '../refernce_table/department/department.module';
@Module({
  imports: [TypeOrmModule.forFeature([Complaints]), DepartmentModule],
  providers: [ComplaintService],
  controllers: [ComplaintController]
})
export class ComplaintModule {}
