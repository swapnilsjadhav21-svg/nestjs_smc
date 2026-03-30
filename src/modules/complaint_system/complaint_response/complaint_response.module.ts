import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { ComplaintResponseService } from './complaint_response.service';
import { ComplaintResponseController } from './complaint_response.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ComplaintResponse])],
  controllers: [ComplaintResponseController],
  providers: [ComplaintResponseService],
  exports: [ComplaintResponseService],
})
export class ComplaintResponseModule {}

