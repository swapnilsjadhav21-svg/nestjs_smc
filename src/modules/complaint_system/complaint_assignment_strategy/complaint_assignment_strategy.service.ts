// complaint-assignment-strategy.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintAssignmentStrategy } from './entities/complaint_assignment_strategy.entity';
import { CreateComplaintAssignmentStrategyDto } from './dto/complaint-assignment-strategy.dto';

@Injectable()
export class ComplaintAssignmentStrategyService extends BaseCrudService<
  ComplaintAssignmentStrategy,
  CreateComplaintAssignmentStrategyDto
> {
  constructor(
    @InjectRepository(ComplaintAssignmentStrategy)
    repository: Repository<ComplaintAssignmentStrategy>,
  ) {
    super(repository);
  }
}