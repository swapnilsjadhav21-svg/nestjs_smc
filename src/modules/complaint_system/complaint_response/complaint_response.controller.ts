import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import { ComplaintResponseService } from './complaint_response.service';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/auth/strategies/jwt.strategy';

@ApiTags('Complaint - Response')
@Controller('complaint')
export class ComplaintResponseController {
  constructor(private readonly complaintResponseService: ComplaintResponseService) {
  }

  @Post(':id/complaint-response')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer posts response to complaint' })
  createResponse(
    @Param('id', ParseIntPipe) complaintId: number,
    @Body() dto: CreateComplaintResponseDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ComplaintResponse> {
    dto.complaint = { id: complaintId };
    dto.user = { id: user.sub };
    return this.complaintResponseService.create(dto);
  }

  @Get(':id/complaint-response')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all responses for a complaint' })
  findByComplaintId(
    @Param('id', ParseIntPipe) complaintId: number,
  ): Promise<ComplaintResponse[]> {
    return this.complaintResponseService.findByComplaintId(complaintId);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all complaint responses' })
  findAll(): Promise<ComplaintResponse[]> {
    return this.complaintResponseService.findAllWithRelations();
  }
}