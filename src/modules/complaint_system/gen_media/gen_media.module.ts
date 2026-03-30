import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenMedia } from './entities/gen_media.entity';
import { GenMediaService } from './gen_media.service';
import { GenMediaController } from './gen_media.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GenMedia])],
  controllers: [GenMediaController],
  providers: [GenMediaService],
  exports: [GenMediaService],
})
export class GenMediaModule {}