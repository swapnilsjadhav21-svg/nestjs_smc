import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintMedia } from './entities/complaint_media.entity';
import { ComplaintMediaService } from './complaint_media.service';
import { ComplaintMediaController } from './complaint_media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintMedia])],
  controllers: [ComplaintMediaController],
  providers: [ComplaintMediaService],
  exports: [ComplaintMediaService],
})
export class ComplaintMediaModule {}
