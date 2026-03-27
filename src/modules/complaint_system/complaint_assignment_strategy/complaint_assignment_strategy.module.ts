import { Module } from '@nestjs/common';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';
import { ComplaintAssignmentStrategyController } from './complaint_assignment_strategy.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintAssignmentStrategy } from './entities/complaint_assignment_strategy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintAssignmentStrategy])],
  providers: [ComplaintAssignmentStrategyService],
  controllers: [ComplaintAssignmentStrategyController],
  exports: [ComplaintAssignmentStrategyService]
})
export class ComplaintAssignmentStrategyModule {}
