import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { ComplaintResponseService } from './complaint_response.service';
import { ComplaintResponseController } from './complaint_response.controller';
import { GenMedia } from 'src/modules/complaint_system/gen_media/entities/gen_media.entity';
import { ComplaintResponseMedia } from 'src/modules/complaint_system/complaint_response_media/entities/complaint_response_media.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintResponse, GenMedia, ComplaintResponseMedia])],
  controllers: [ComplaintResponseController],
  providers: [ComplaintResponseService],
  exports: [ComplaintResponseService],
})
export class ComplaintResponseModule {}

