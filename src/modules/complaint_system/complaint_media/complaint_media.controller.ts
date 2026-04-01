import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { ComplaintMedia } from './entities/complaint_media.entity';
import { CreateComplaintMediaDto } from './dto/create-complaint-media.dto';
import { ComplaintMediaService } from './complaint_media.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('Complaint - Media')
@Controller('complaint-media')
export class ComplaintMediaController  {
  constructor(private readonly complaintMediaService: ComplaintMediaService) {
  }

  // @Post(':id/media')
  // @ApiOperation({ summary: 'Attach media to a complaint' })
  // @ApiBody({ type: CreateComplaintMediaDto })
  // attachMedia(
  //   @Param('id', ParseIntPipe) complaintId: number,
  //   @Body() dto: CreateComplaintMediaDto,
  // ): Promise<ComplaintMedia> {
  //   dto.complaint = { id: complaintId };
  //   return this.complaintMediaService.create(dto);
  // }

  @Get(':id/media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all media for a complaint' })
  findByComplaintId(
    @Param('id', ParseIntPipe) complaintId: number,
  ): Promise<ComplaintMedia[]> {
    return this.complaintMediaService.findByComplaintId(complaintId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all complaint media' })
  findAll(): Promise<ComplaintMedia[]> {
    return this.complaintMediaService.findAllWithRelations();
  }
}