// complaint.controller.ts
import { Body, Controller, Get, Param,
         ParseIntPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ReassignComplaintDto } from './dto/reassign-complaint.dto';
import { Complaint } from './entities/complaint.entity';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  // Note: This controller does NOT extend BaseCrudController
  // because complaint has too much custom logic for the base to handle

  @Post()
  @ApiOperation({ summary: 'Citizen creates a new complaint' })
  create(@Body() dto: CreateComplaintDto): Promise<Complaint> {
    // citizenId will come from JWT token later when auth is integrated
    // hardcoded to 1 for now during development
    const citizenId = 1;
    return this.complaintService.create(dto, citizenId);
  }

  @Get('my')
  @ApiOperation({ summary: 'Citizen views their own complaints' })
  findMyCitizenComplaints(): Promise<Complaint[]> {
    const citizenId = 1; // will come from JWT later
    return this.complaintService.findMyCitizenComplaints(citizenId);
  }

  @Get('assigned')
  @ApiOperation({ summary: 'Officer views complaints assigned to them' })
  findAssignedComplaints(): Promise<Complaint[]> {
    const officerId = 1; // will come from JWT later
    return this.complaintService.findAssignedComplaints(officerId);
  }

  @Get('team')
  @ApiOperation({ summary: 'Officer views their team complaints' })
  findTeamComplaints(): Promise<Complaint[]> {
    const officerId = 1; // will come from JWT later
    return this.complaintService.findTeamComplaints(officerId);
  }

  // ⚠️ :id routes MUST come after all named routes (my, assigned, team)
  // otherwise NestJS matches "my" as an :id param
  @Get(':id')
  @ApiOperation({ summary: 'Get single complaint detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

  @Post(':id/claim')
  @ApiOperation({ summary: 'Officer claims an unassigned NEW complaint' })
  claim(@Param('id', ParseIntPipe) id: number): Promise<Complaint> {
    const officerId = 1; // will come from JWT later
    return this.complaintService.claimComplaint(id, officerId);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Officer updates complaint status' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateComplaintStatusDto,
  ): Promise<Complaint> {
    const officerId = 1; // will come from JWT later
    return this.complaintService.updateStatus(id, dto, officerId);
  }

  @Post(':id/reassign')
  @ApiOperation({ summary: 'Officer reassigns complaint to another officer' })
  reassign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReassignComplaintDto,
  ): Promise<Complaint> {
    const officerId = 1; // will come from JWT later
    return this.complaintService.reassign(id, dto, officerId);
  }
}