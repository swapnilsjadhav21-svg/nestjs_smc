import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreateComplaintMediaDto {
  @ApiProperty({ type: RefIdDto })
  complaint: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  media: RefIdDto;
}