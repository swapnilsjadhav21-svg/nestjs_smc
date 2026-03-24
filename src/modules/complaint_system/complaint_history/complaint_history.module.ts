import { Module } from '@nestjs/common';
import { ComplaintHistoryService } from './complaint_history.service';
import { ComplaintHistoryController } from './complaint_history.controller';

@Module({
  providers: [ComplaintHistoryService],
  controllers: [ComplaintHistoryController]
})
export class ComplaintHistoryModule {}
