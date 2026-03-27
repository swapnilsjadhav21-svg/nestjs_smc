import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateComplaintAssignmentConfigDto {
  @ApiProperty({ type: RefIdDto })
  complaint_type: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  strategy: RefIdDto;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  designation?: RefIdDto;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  department?: RefIdDto;
}