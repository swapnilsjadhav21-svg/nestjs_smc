import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintService } from './complaint.service';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController extends BaseCrudController<Complaint, CreateComplaintDto> {
  constructor(private readonly complaintService: ComplaintService) {
    super(complaintService);
  }

  @Post()
  @ApiOperation({ summary: 'Create complaint and auto-assign officer' })
  override create(@Body() dto: CreateComplaintDto): Promise<Complaint> {
    return super.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaints with relations' })
  override findAll(): Promise<Complaint[]> {
    return this.complaintService.findAllWithRelations();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get complaint by ID' })
  override findOne(@Param('id', ParseIntPipe) id: number): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update complaint status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplaintStatusDto,
  ): Promise<Complaint> {
    return this.complaintService.updateStatus(id, dto.newStatus, dto.remark);
  }
}