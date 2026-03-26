import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateAppUserDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  @IsNotEmpty()
  employee_code: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  mobile_no: string;

  @ApiProperty({ example: 'Rahul Patil' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'राहुल पाटील', required: false })
  @IsOptional()
  @IsString()
  name_marathi?: string;

  @ApiProperty({ type: RefIdDto })
  designation: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  department: RefIdDto;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  reporting_to?: RefIdDto;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_system_user?: boolean;
}