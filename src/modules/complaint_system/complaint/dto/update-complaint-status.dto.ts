// dto/update-complaint-status.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export class UpdateComplaintStatusDto {
  @ApiProperty({ enum: ComplaintStatus })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus;

  @ApiProperty({ example: 'Issue has been resolved', required: false })
  @IsOptional()
  @IsString()
  remark?: string;             // officer can add a remark when updating status
}