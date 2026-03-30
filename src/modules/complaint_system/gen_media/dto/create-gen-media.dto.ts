import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateGenMediaDto {
  @ApiProperty({ example: '/complaint/1/photo.jpg' })
  @IsString()
  @IsNotEmpty()
  file_path: string;

  @ApiProperty({ example: 'jpg' })
  @IsString()
  @IsNotEmpty()
  file_type: string;
}