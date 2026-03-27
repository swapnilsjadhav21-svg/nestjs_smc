import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintAssignmentStrategy } from './entities/complaint_assignment_strategy.entity';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';
import { ComplaintAssignmentStrategyController } from './complaint_assignment_strategy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintAssignmentStrategy])],
  controllers: [ComplaintAssignmentStrategyController],
  providers: [ComplaintAssignmentStrategyService],
  exports: [ComplaintAssignmentStrategyService],
})
export class ComplaintAssignmentStrategyModule {}