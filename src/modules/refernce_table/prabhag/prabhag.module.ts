import { Module } from '@nestjs/common';
import { PrabhagService } from './prabhag.service';
import { PrabhagController } from './prabhagcontroller';

@Module({
  providers: [PrabhagService],
  controllers: [PrabhagController]
})
export class PrabhagModule {}
