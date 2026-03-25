import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrabhagService } from './prabhag.service';
import { PrabhagController } from './prabhagcontroller';
import { Prabhag } from './entities/prabhag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Prabhag])],
  providers: [PrabhagService],
  controllers: [PrabhagController],
})
export class PrabhagModule {}
