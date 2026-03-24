import { Module } from '@nestjs/common';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';
import { ComplaintAssignmentConfigController } from './complaint_assignment_config.controller';

@Module({
  providers: [ComplaintAssignmentConfigService],
  controllers: [ComplaintAssignmentConfigController]
})
export class ComplaintAssignmentConfigModule {}
