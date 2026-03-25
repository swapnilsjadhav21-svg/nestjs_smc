import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateDesignationDto {
  @ApiProperty({ example: 'JE' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Junior Engineer' })
  @IsString()
  name: string;

  @ApiProperty({ example: 3 })
  @IsNumber()
  hierarchy_level: number;
}
