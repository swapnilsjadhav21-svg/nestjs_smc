import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ComplaintStatus } from '../enums/complaint-status.enum';

export class CitizenUpdateComplaintDto {
  @ApiProperty({
    enum: [ComplaintStatus.REOPENED, ComplaintStatus.ESCALATED],
    description: 'Citizens can only REOPEN or ESCALATE',
  })
  @IsEnum(ComplaintStatus)
  status: ComplaintStatus.REOPENED | ComplaintStatus.ESCALATED;
}

export class OfficerUpdateComplaintDto {
  @ApiProperty({ enum: ComplaintStatus, required: false })
  @IsOptional()
  @IsEnum(ComplaintStatus)
  status?: ComplaintStatus;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  assigned_to_id?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  department_id?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  zone_id?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  prabhag_id?: number;

  @ApiProperty({ example: 'Remark text', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}