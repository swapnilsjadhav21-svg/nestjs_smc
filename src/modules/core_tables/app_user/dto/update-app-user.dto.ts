// dto/update-app-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateAppUserDto } from './create-app-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from './create-app-user.dto';

export class UpdateAppUserDto extends PartialType(CreateAppUserDto) {}

// Separate DTO for status update endpoint
export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  status: UserStatus;
}