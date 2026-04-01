import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintResponseMedia } from './entities/complaint_response_media.entity';
import { CreateComplaintResponseMediaDto } from './dto/complaint-response-media.dto';
import { ComplaintResponseMediaService } from './complaint_response_media.service';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';

@ApiTags('Complaint - Response Media')
@Controller('complaint-response-media')
export class ComplaintResponseMediaController extends BaseCrudController<ComplaintResponseMedia, CreateComplaintResponseMediaDto> {
  constructor(private readonly complaintResponseMediaService: ComplaintResponseMediaService) {
    super(complaintResponseMediaService);
  }

  @Post(':id/media')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Attach media to a complaint response' })
  @ApiBody({ type: CreateComplaintResponseMediaDto })
  attachMedia(
    @Param('id', ParseIntPipe) responseId: number,
    @Body() dto: CreateComplaintResponseMediaDto,
  ): Promise<ComplaintResponseMedia> {
    dto.complaint_response = { id: responseId };
    return this.complaintResponseMediaService.create(dto);
  }

  @Get(':id/media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all media for a complaint response' })
  findByResponseId(
    @Param('id', ParseIntPipe) responseId: number,
  ): Promise<ComplaintResponseMedia[]> {
    return this.complaintResponseMediaService.findByResponseId(responseId);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all complaint response media' })
  override findAll(): Promise<ComplaintResponseMedia[]> {
    return this.complaintResponseMediaService.findAllWithRelations();
  }
}