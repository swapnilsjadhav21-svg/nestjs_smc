import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreatePrabhagDto {
  @ApiProperty({ example: 'Prabhag 1' })
  @IsString()
  name: string;
}
