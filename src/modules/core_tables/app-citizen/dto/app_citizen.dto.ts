import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAppCitizenDto {

  @ApiProperty({ example: "1234567890" })
  @IsString()
  mobile_no:string;

  @ApiProperty({ example: 'Sagar Dhale' })
  @IsString()
  name: string;
}
