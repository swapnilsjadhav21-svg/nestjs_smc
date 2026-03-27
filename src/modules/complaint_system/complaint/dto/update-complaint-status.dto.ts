import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateComplaintStatusDto {
  @ApiProperty({ example: 'IN_PROGRESS' })
  @IsString()
  @IsNotEmpty()
  newStatus: string;

  @ApiProperty({ example: 'Officer started working on this', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}