import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

export class CreatePrabhagZoneMappingDto {
  @ApiProperty({ type: RefIdDto })
  prabhag: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  zone: RefIdDto;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
