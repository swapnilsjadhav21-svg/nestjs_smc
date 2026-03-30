// complaint.controller.ts
import { Body, Controller, Get, Param,
         ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ReassignComplaintDto } from './dto/reassign-complaint.dto';
import { Complaint } from './entities/complaint.entity';
import { CitizenGuard } from 'src/auth/guards/citizen.guard';
import { OfficerGuard } from 'src/auth/guards/officer.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/auth/strategies/jwt.strategy';
import { ComplaintStatus } from './enums/complaint-status.enum';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  // Note: This controller does NOT extend BaseCrudController
  // because complaint has too much custom logic for the base to handle

  @Post()
  @UseGuards(CitizenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Citizen creates a new complaint' })
  create(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.create(dto, user.sub);
  }

  @Get('my')
  @UseGuards(CitizenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Citizen views their own complaints' })
  findMyCitizenComplaints(
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint[]> {
    return this.complaintService.findMyCitizenComplaints(user.sub);
  }

  @Post(':id/reopen')
  @UseGuards(CitizenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Citizen reopens a resolved complaint' })
  reopen(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.updateStatus(
      id,
      { status: ComplaintStatus.REOPENED },
      user.sub,
    );
  }

  @Post(':id/escalate')
  @UseGuards(CitizenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Citizen escalates a rejected complaint' })
  escalate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.updateStatus(
      id,
      { status: ComplaintStatus.ESCALATED },
      user.sub,
    );
  }

  @Get('assigned')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer views complaints assigned to them' })
  findAssignedComplaints(
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint[]> {
    return this.complaintService.findAssignedComplaints(user.sub);
  }

  @Get('team')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer views their team complaints' })
  findTeamComplaints(
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint[]> {
    return this.complaintService.findTeamComplaints(user.sub);
  }

  // ⚠️ :id routes MUST come after all named routes (my, assigned, team)
  // otherwise NestJS matches "my" as an :id param
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single complaint detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

  @Post(':id/claim')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer claims an unassigned NEW complaint' })
  claim(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.claimComplaint(id, user.sub);
  }

  @Post(':id/status')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer updates complaint status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplaintStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.updateStatus(id, dto, user.sub);
  }

  @Post(':id/reassign')
  @UseGuards(OfficerGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Officer reassigns complaint to another officer' })
  reassign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReassignComplaintDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<Complaint> {
    return this.complaintService.reassign(id, dto, user.sub);
  }
}