import { Module } from '@nestjs/common';
import { ComplaintTypeService } from './complaint_type.service';
import { ComplaintTypeController } from './complaint_type.controller';

@Module({
  providers: [ComplaintTypeService],
  controllers: [ComplaintTypeController]
})
export class ComplaintTypeModule {}
