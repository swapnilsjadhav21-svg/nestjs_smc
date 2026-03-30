import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateComplaintResponseMediaDto {
  @ApiProperty({ type: RefIdDto })
  complaint_response: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  media: RefIdDto;
}