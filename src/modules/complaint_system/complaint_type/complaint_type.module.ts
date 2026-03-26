import { Module } from '@nestjs/common';
import { ComplaintTypeService } from './complaint_type.service';
import { ComplaintTypeController } from './complaint_type.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintType } from './entities/complaint_type.entity';

@Module({
  imports :[TypeOrmModule.forFeature([ComplaintType])],
  providers: [ComplaintTypeService],
  controllers: [ComplaintTypeController]
})
export class ComplaintTypeModule {}
