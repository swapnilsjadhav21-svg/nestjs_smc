import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateComplainttypetDto {
  @ApiProperty({ example: 'Road - Pothole repair ' })
  @IsString()
  name: string;
}
