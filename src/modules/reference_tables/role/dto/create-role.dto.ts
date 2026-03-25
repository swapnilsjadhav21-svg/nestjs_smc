import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'ADMIN' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'Administrator' })
  @IsString()
  name: string;
}
