// dto/reassign-complaint.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReassignComplaintDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  assigned_to_id: number;      // ID of officer to reassign to

  @ApiProperty({ example: 'Reassigning to correct zone officer', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}