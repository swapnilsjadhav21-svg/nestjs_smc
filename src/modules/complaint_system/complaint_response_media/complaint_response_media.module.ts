import { Module } from '@nestjs/common';
import { ComplaintResponseMediaService } from './complaint_response_media.service';
import { ComplaintResponseMediaController } from './complaint_response_media.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintResponseMedia } from './entities/complaint_response_media.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ComplaintResponseMedia])],
  providers: [ComplaintResponseMediaService],
  controllers: [ComplaintResponseMediaController],
  exports:[ComplaintResponseMediaService],
})
export class ComplaintResponseMediaModule {}
