import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintAssignmentStrategy } from './entities/complaint_assignment_strategy.entity';
import { CreateComplaintAssignmentStrategyDto } from './dto/complaint-assignment-strategy.dto';
import { ComplaintAssignmentStrategyService } from './complaint_assignment_strategy.service';

@ApiTags('Complaint - Assignment Strategy')
@Controller('reference/complaint-assignment-strategy')
export class ComplaintAssignmentStrategyController extends BaseCrudController<ComplaintAssignmentStrategy, CreateComplaintAssignmentStrategyDto> {
  constructor(
    private readonly complaintAssignmentStrategyService: ComplaintAssignmentStrategyService,
  ) {
    super(complaintAssignmentStrategyService);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create Assignment Strategy' })
  // override create(@Body() dto: CreateComplaintAssignmentStrategyDto): Promise<ComplaintAssignmentStrategy> {
  //   return super.create(dto);
  // }

  @Get()
  @ApiOperation({ summary: 'Get all Assignment Strategies' })
  override findAll(): Promise<ComplaintAssignmentStrategy[]> {
    return super.findAll();
  }
}