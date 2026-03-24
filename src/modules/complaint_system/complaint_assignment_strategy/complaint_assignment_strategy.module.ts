import { Module } from '@nestjs/common';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';
import { ComplaintAssignmentStrategyController } from './complaint_assignment_strategy.controller';

@Module({
  providers: [ComplaintAssignmentStrategyService],
  controllers: [ComplaintAssignmentStrategyController]
})
export class ComplaintAssignmentStrategyModule {}
