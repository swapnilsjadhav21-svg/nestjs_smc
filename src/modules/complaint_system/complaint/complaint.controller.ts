import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  @Post()
  @ApiOperation({ summary: 'Create Complaint' })
  create(@Body() dto: CreateComplaintDto) {
    return this.complaintService.createComplaint(dto);
  }
}