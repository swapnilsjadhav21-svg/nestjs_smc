import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { ComplaintAssignmentConfigModule } from '../complaint_assignment_config/complaint_assignment_config.module';
import { PrabhagZoneMappingModule } from 'src/modules/reference_tables/prabhag_zone_mapping/prabhagZoneMapping.module';
import { AppUserModule } from 'src/modules/core_tables/app_user/app_user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint]),
    ComplaintAssignmentConfigModule,
    PrabhagZoneMappingModule,
    AppUserModule,
  ],
  controllers: [ComplaintController],
  providers: [ComplaintService],
  exports: [ComplaintService],
})
export class ComplaintModule {}