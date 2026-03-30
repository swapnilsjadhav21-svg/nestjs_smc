import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import { ComplaintResponseService } from './complaint_response.service';

@ApiTags('Complaint - Response')
@Controller('complaint')
export class ComplaintResponseController extends BaseCrudController<ComplaintResponse, CreateComplaintResponseDto> {
  constructor(private readonly complaintResponseService: ComplaintResponseService) {
    super(complaintResponseService);
  }

  @Post(':id/complaint-response')
  @ApiOperation({ summary: 'Post a response to a complaint' })
  @ApiBody({ type: CreateComplaintResponseDto })
  createResponse(
    @Param('id', ParseIntPipe) complaintId: number,
    @Body() dto: CreateComplaintResponseDto,
  ): Promise<ComplaintResponse> {
    dto.complaint = { id: complaintId };
    return this.complaintResponseService.create(dto);
  }

  @Get(':id/complaint-response')
  @ApiOperation({ summary: 'Get all responses for a complaint' })
  findByComplaintId(
    @Param('id', ParseIntPipe) complaintId: number,
  ): Promise<ComplaintResponse[]> {
    return this.complaintResponseService.findByComplaintId(complaintId);
  }
}