import { Module } from '@nestjs/common';
import { ComplaintMediaService } from './complaint_media.service';
import { ComplaintMediaController } from './complaint_media.controller';

@Module({
  providers: [ComplaintMediaService],
  controllers: [ComplaintMediaController]
})
export class ComplaintMediaModule {}
