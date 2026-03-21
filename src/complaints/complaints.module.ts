import { Module } from '@nestjs/common';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Complaint } from './complaints.model';

@Module({
  imports: [ SequelizeModule.forFeature([Complaint])],
  controllers: [ComplaintsController],
  providers: [ComplaintsService]
})
export class ComplaintsModule {}
