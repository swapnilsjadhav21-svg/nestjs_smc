import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintResponseMedia } from './entities/complaint_response_media.entity';
import { CreateComplaintResponseMediaDto } from './dto/complaint-response-media.dto';
import { ComplaintResponseMediaService } from './complaint_response_media.service';

@ApiTags('Complaint - Response Media')
@Controller('complaint-response')
export class ComplaintResponseMediaController extends BaseCrudController<ComplaintResponseMedia, CreateComplaintResponseMediaDto> {
  constructor(private readonly complaintResponseMediaService: ComplaintResponseMediaService) {
    super(complaintResponseMediaService);
  }

  @Post(':id/media')
  @ApiOperation({ summary: 'Attach media to a complaint response' })
  attachMedia(
    @Param('id', ParseIntPipe) responseId: number,
    @Body() dto: CreateComplaintResponseMediaDto,
  ): Promise<ComplaintResponseMedia> {
    dto.complaint_response = { id: responseId };
    return this.complaintResponseMediaService.create(dto);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get all media for a complaint response' })
  findByResponseId(
    @Param('id', ParseIntPipe) responseId: number,
  ): Promise<ComplaintResponseMedia[]> {
    return this.complaintResponseMediaService.findByResponseId(responseId);
  }
}