import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintMedia } from '../complaint_media/entities/complaint_media.entity';
import { CreateComplaintMediaDto } from '../complaint_media/dto/create-complaint-media.dto';
import { ComplaintMediaService } from './gen_media.service';

@ApiTags('Complaint - Media')
@Controller('complaint-media')
export class ComplaintMediaController extends BaseCrudController<ComplaintMedia, CreateComplaintMediaDto> {
  constructor(private readonly complaintMediaService: ComplaintMediaService) {
    super(complaintMediaService);
  }

  @Post(':id/media')
  @ApiOperation({ summary: 'Attach media to a complaint' })
  @ApiBody({ type: CreateComplaintMediaDto })
  attachMedia(
    @Param('id', ParseIntPipe) complaintId: number,
    @Body() dto: CreateComplaintMediaDto,
  ): Promise<ComplaintMedia> {
    dto.complaint = { id: complaintId };
    return this.complaintMediaService.create(dto);
  }

  @Get(':id/media')
  @ApiOperation({ summary: 'Get all media for a complaint' })
  findByComplaintId(
    @Param('id', ParseIntPipe) complaintId: number,
  ): Promise<ComplaintMedia[]> {
    return this.complaintMediaService.findByComplaintId(complaintId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all complaint media' })
  override findAll(): Promise<ComplaintMedia[]> {
    return this.complaintMediaService.findAllWithRelations();
  }
}