// dto/create-complaint.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

class RefIdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;
}

class LocationDto {
  @ApiProperty({ example: 17.6599 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 75.9064 })
  @IsNumber()
  longitude: number;
}

export class CreateComplaintDto {
  @ApiProperty({ type: RefIdDto })
  complaint_type: RefIdDto;

  @ApiProperty({ example: 'There is a big pothole near my house' })
  @IsString()
  @IsNotEmpty()
  complaint: string;

  @ApiProperty({ type: RefIdDto, required: false })
  @IsOptional()
  prabhag?: RefIdDto;          // optional — citizen may not know their prabhag

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  location?: LocationDto;      // optional — citizen may not share location
}