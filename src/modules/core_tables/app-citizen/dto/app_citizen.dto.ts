import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateAppCitizenDto {

  @ApiProperty({ example: "1234567890" })
  @IsString()
  mobile_no:string;

  @ApiProperty({ example: 'Sagar Dhale' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123 Main Street, Solapur', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'citizen@email.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
}
