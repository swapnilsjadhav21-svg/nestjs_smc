// complaint.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Complaint } from './entities/complaint.entity';
import { ComplaintService } from './complaint.service';
import { ComplaintController } from './complaint.controller';
import { AssignmentEngineService } from './assignment-engine.service';
import { ComplaintAssignmentConfig } from '../complaint_assignment_config/entities/complaint_assignment_config.entity';
import { PrabhagZoneMapping } from 'src/modules/reference_tables/prabhag_zone_mapping/entities/prabhagZoneMapping.entity';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { GenMedia } from '../gen_media/entities/gen_media.entity';
import { ComplaintMedia } from '../complaint_media/entities/complaint_media.entity';
import { GenMediaService } from '../gen_media/gen_media.service';
import { ComplaintMediaService } from '../complaint_media/complaint_media.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Complaint,
      ComplaintAssignmentConfig,  // needed by assignment engine
      PrabhagZoneMapping,         // needed by assignment engine
      AppUser,                    // needed by assignment engine
      GenMedia,
      ComplaintMedia,
    ]),
  ],
  controllers: [ComplaintController],
  providers: [
    ComplaintService,
    AssignmentEngineService,      // registered as a provider in same module
    GenMediaService,
    ComplaintMediaService,
  ],
  exports: [ComplaintService],    // complaint_history will need this
})
export class ComplaintModule {}