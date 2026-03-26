import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAppUserDto {

  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employee_code: string;

  @ApiProperty({ example: '9876543210' })
  @IsString()
  mobile_number: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'जॉन डो', required: false })
  @IsOptional()
  @IsString()
  name_marathi?: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  designation_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  department_id: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  reporting_to?: number;

  @ApiProperty({ example: 'ACTIVE' })
  @IsString()
  status: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_system_user: boolean;
}