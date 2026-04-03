import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import { ComplaintResponseService } from './complaint_response.service';
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
  @ApiOperation({ summary: 'Officer posts response to complaint with optional media' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reply: {
          type: 'string',
          example: 'We have assigned a team to fix this issue',
          description: 'Response text from officer',
        },
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional media files — max 4, 5MB each, jpg/jpeg/png only',
        },
      },
      required: ['reply'],
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) =>
          cb(null, Date.now() + extname(file.originalname)),
      }),
      limits: { fileSize: 5 * 1024 * 1024, files: 20 },
      fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png'];
        allowed.includes(extname(file.originalname).toLowerCase())
          ? cb(null, true)
          : cb(new BadRequestException('Only jpg, jpeg, png allowed'), false);
      },
    }),
  )
  createResponse(
    @Param('id', ParseIntPipe) complaintId: number,
    @Body() dto: CreateComplaintResponseDto,
    @CurrentUser() user: JwtPayload,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ComplaintResponse> {
    if (files && files.length > 4) {
      throw new BadRequestException('Maximum 4 files allowed');
    }
    dto.complaint = { id: complaintId };
    dto.user = { id: user.sub };
    return this.complaintResponseService.createWithMedia(dto, files);
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

  // @Get('complaint-response')
  // @UseGuards(AdminGuard)
  // @ApiBearerAuth('JWT-auth')
  // @ApiOperation({ summary: 'Get all complaint responses' })
  // findAll(): Promise<ComplaintResponse[]> {
  //   return this.complaintResponseService.findAllWithRelations();
  // }
}