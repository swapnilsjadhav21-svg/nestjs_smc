import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateComplaintResponseDto {
  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  complaint?: RefIdDto;

  @ApiProperty({ example: 'We have assigned an officer to fix this issue' })
  @IsString()
  @IsNotEmpty()
  reply: string;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  user?: RefIdDto;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  citizen?: RefIdDto;
}