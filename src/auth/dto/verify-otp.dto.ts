// dto/verify-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsEnum } from 'class-validator';
import { UserType } from './send-otp.dto';

export class VerifyOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobile_number: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp: string;

  @ApiProperty({ enum: UserType, example: UserType.CITIZEN })
  @IsEnum(UserType)
  user_type: UserType;
}