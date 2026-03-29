// dto/send-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobile_number: string;
}