// dto/send-otp.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsEnum } from 'class-validator';

export enum UserType {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
}

export class SendOtpDto {
  @ApiProperty({ example: '9876543210' })
  @IsString()
  @IsNotEmpty()
  @Length(10, 10, { message: 'Mobile number must be exactly 10 digits' })
  mobile_number: string;

  @ApiProperty({ enum: UserType, example: UserType.CITIZEN })
  @IsEnum(UserType)
  user_type: UserType;
}