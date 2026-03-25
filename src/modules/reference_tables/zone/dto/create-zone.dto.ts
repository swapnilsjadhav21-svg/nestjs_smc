import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateZoneDto {

  @ApiProperty({ example: 'Zone 1' })
  @IsString()
  name: string;
}