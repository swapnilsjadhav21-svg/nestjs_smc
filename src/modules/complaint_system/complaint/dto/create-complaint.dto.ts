import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

class LocationDto {
  @ApiProperty({ example: 18.6161 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 73.7286 })
  @IsNumber()
  longitude: number;
}

export class CreateComplaintDto {
  @ApiProperty({ type: RefIdDto })
  citizen: RefIdDto;

  @ApiProperty({ type: RefIdDto })
  complaint_type: RefIdDto;

  @ApiProperty({ example: 'There is a large pothole near the main road' })
  @IsString()
  @IsNotEmpty()
  complaint: string;

    @ApiProperty({ example: 'NEW' })
    status:string;

  @ApiProperty({ type: RefIdDto })
  prabhag: RefIdDto;

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  location?: LocationDto;
}