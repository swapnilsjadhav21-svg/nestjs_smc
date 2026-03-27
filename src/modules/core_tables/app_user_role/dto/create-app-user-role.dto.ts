// dto/create-app-user-role.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateAppUserRoleDto {
  @ApiProperty({ type: RefIdDto })
  appUser: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  role: RefIdDto;
}