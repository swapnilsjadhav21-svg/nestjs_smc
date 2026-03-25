import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Solid Waste Department' })
  @IsString()
  name: string;
}
