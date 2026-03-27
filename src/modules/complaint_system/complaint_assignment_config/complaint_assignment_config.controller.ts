import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintAssignmentConfig } from './entities/complaint_assignment_config.entity';
import { CreateComplaintAssignmentConfigDto } from './dto/complaint-assignment-config.dto';
import { ComplaintAssignmentConfigService } from './complaint_assignment_config.service';

@ApiTags('Complaint - Assignment Config')
@Controller('reference/complaint-assignment-config')
export class ComplaintAssignmentConfigController extends BaseCrudController<ComplaintAssignmentConfig, CreateComplaintAssignmentConfigDto> {
  constructor(
    private readonly complaintAssignmentConfigService: ComplaintAssignmentConfigService,
  ) {
    super(complaintAssignmentConfigService);
  }

  @Post()
  @ApiOperation({ summary: 'Create Complaint Assignment Config' })
  override create(@Body() dto: CreateComplaintAssignmentConfigDto): Promise<ComplaintAssignmentConfig> {
    return super.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Complaint Assignment Configs' })
  override findAll(): Promise<ComplaintAssignmentConfig[]> {
    return this.complaintAssignmentConfigService.findAllWithRelations();
  }
}