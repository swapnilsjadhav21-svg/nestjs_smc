import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintAssignmentConfig } from './entities/complaint_assignment_config.entity';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';
import { ComplaintAssignmentConfigController } from './complaint_assignment_config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintAssignmentConfig])],
  controllers: [ComplaintAssignmentConfigController],
  providers: [ComplaintAssignmentConfigService],
  exports: [ComplaintAssignmentConfigService],
})
export class ComplaintAssignmentConfigModule {}