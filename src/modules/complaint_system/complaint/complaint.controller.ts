// complaint.controller.ts
import { BadRequestException, Body, Controller, ForbiddenException, Get, Param,
         ParseIntPipe, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ComplaintService } from './complaint.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { CitizenUpdateComplaintDto, OfficerUpdateComplaintDto } from './dto/update-complaint-status.dto';
import { Complaint } from './entities/complaint.entity';
import { CitizenGuard } from 'src/auth/guards/citizen.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import type { JwtPayload } from 'src/auth/strategies/jwt.strategy';

@ApiTags('Complaint')
@Controller('complaint')
export class ComplaintController {
  constructor(private readonly complaintService: ComplaintService) {}

  //for fliter
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get complaints with filters and pagination' })
  @ApiQuery({ name: 'zone_id', required: false, type: Number })
  @ApiQuery({ name: 'prabhag_id', required: false, type: Number })
  @ApiQuery({ name: 'department_id', required: false, type: Number })
  @ApiQuery({ name: 'assigned_to', required: false, type: Number })
  @ApiQuery({ name: 'citizen_id', required: false, type: Number })
  @ApiQuery({ name: 'complaint_type_id', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'team', required: false, type: Boolean, description: 'When true, filter by current officer team/department' })
  @ApiQuery({ name: 'start_date', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'end_date', required: false, type: String, description: 'Format: YYYY-MM-DD' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'page_size', required: false, type: Number })
  findWithFilters(
    @Query('zone_id') zone_id?: number,
    @Query('prabhag_id') prabhag_id?: number,
    @Query('department_id') department_id?: number,
    @Query('assigned_to') assigned_to?: number,
    @Query('citizen_id') citizen_id?: number,
    @Query('complaint_type_id') complaint_type_id?: number,
    @Query('status') status?: string,
    @Query('team') team?: string,
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('page') page?: number,
    @Query('page_size') page_size?: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const useTeamFilter = team === 'true' || team === '1';
    return this.complaintService.findWithFilters({
      zone_id: zone_id ? Number(zone_id) : undefined,
      prabhag_id: prabhag_id ? Number(prabhag_id) : undefined,
      department_id: department_id ? Number(department_id) : undefined,
      assigned_to: assigned_to ? Number(assigned_to) : undefined,
      citizen_id: citizen_id ? Number(citizen_id) : undefined,
      complaint_type_id: complaint_type_id ? Number(complaint_type_id) : undefined,
      status,
      team_officer_id: useTeamFilter ? user?.sub : undefined,
      start_date,
      end_date,
      page: page ? Number(page) : 1,
      page_size: page_size ? Number(page_size) : 50,
    });
  }

  // Note: This controller does NOT extend BaseCrudController
  // because complaint has too much custom logic for the base to handle

  @Post()
  @UseGuards(CitizenGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Citizen creates a new complaint with optional media' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['complaint_type', 'complaint', 'prabhag', 'files'],
      properties: {
        complaint_type: {
          type: 'string',
          example: '{"id": 2}',
          description: 'JSON string with complaint type id',
        },
        complaint: {
          type: 'string',
          example: 'Garbage not collected for 3 days near market area',
        },
        prabhag: {
          type: 'string',
          example: '{"id": 5}',
          description: 'JSON string with prabhag id',
        },
        location: {
          type: 'string',
          example: '{"latitude": 17.6599, "longitude": 75.9064}',
          description: 'Optional JSON string with complaint coordinates',
        },
        files: {
          type: 'array',
          maxItems: 4,
          description: 'Maximum 4 files allowed',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 4, {
    storage: diskStorage({
      destination: './uploads/temp',
      filename: (req, file, cb) => cb(null, Date.now() + extname(file.originalname)),
    }),
    limits: { fileSize: 5 * 1024 * 1024, files: 4 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png'];
      allowed.includes(extname(file.originalname).toLowerCase())
        ? cb(null, true)
        : cb(new BadRequestException('Only jpg, jpeg, png allowed'), false);
    },
  }))
  create(
    @Body() dto: CreateComplaintDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<Complaint> {
    if (files && files.length > 4) {
      throw new BadRequestException('Maximum 4 files allowed');
    }
    if (typeof dto.complaint_type === 'string') dto.complaint_type = JSON.parse(dto.complaint_type);
    if (typeof dto.prabhag === 'string') dto.prabhag = JSON.parse(dto.prabhag);
    if (typeof dto.location === 'string') dto.location = JSON.parse(dto.location);
    return this.complaintService.create(dto, user.sub, files);
  }

  // @Get('my')
  // @UseGuards(CitizenGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Citizen views their own complaints' })
  // findMyCitizenComplaints(
  //   @CurrentUser() user: JwtPayload,
  // ): Promise<Complaint[]> {
  //   return this.complaintService.findMyCitizenComplaints(user.sub);
  // }

  @Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ summary: 'Update complaint — citizen: reopen/escalate | officer: status/reassign/zone/dept' })
@ApiBody({
  schema: {
    type: 'object',
    properties: {
      // Citizen fields
      status: {
        type: 'string',
        enum: ['REOPENED', 'ESCALATED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
        description: 'CITIZEN: REOPENED or ESCALATED only | OFFICER: any valid transition',
      },
      // Officer only fields
      assigned_to_id: {
        type: 'number',
        description: 'OFFICER only — reassign to another officer',
      },
      department_id: {
        type: 'number',
        description: 'OFFICER only — update department',
      },
      zone_id: {
        type: 'number',
        description: 'OFFICER only — update zone',
      },
      prabhag_id: {
        type: 'number',
        description: 'OFFICER only — update prabhag',
      },
      remark: {
        type: 'string',
        description: 'OFFICER only — optional remark',
      },
    },
  },
})
updateComplaint(
  @Param('id', ParseIntPipe) id: number,
  @Body() dto: CitizenUpdateComplaintDto | OfficerUpdateComplaintDto,
  @CurrentUser() user: JwtPayload,
): Promise<Complaint> {
  if (!dto || typeof dto !== 'object' || Object.keys(dto).length === 0) {
    throw new BadRequestException('Update payload is required');
  }

  if (user.type === 'CITIZEN') {
    if (!(dto as CitizenUpdateComplaintDto).status) {
      throw new BadRequestException('status is required for citizen update');
    }
    return this.complaintService.citizenUpdate(
      id, dto as CitizenUpdateComplaintDto, user.sub
    );
  }

  if (user.type === 'OFFICER') {
    return this.complaintService.officerUpdate(
      id, dto as OfficerUpdateComplaintDto, user.sub
    );
  }

  throw new ForbiddenException('Unsupported user type for complaint update');
}

  // @Get('assigned')
  // @UseGuards(OfficerGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Officer views complaints assigned to them' })
  // findAssignedComplaints(
  //   @CurrentUser() user: JwtPayload,
  // ): Promise<Complaint[]> {
  //   return this.complaintService.findAssignedComplaints(user.sub);
  // }

  // @Get('team')
  // @UseGuards(OfficerGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Officer views their team complaints' })
  // findTeamComplaints(
  //   @CurrentUser() user: JwtPayload,
  // ): Promise<Complaint[]> {
  //   return this.complaintService.findTeamComplaints(user.sub);
  // }

  // ⚠️ :id routes MUST come after all named routes (my, assigned, team)
  // otherwise NestJS matches "my" as an :id param
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get single complaint detail' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Complaint> {
    return this.complaintService.findOne(id);
  }

}