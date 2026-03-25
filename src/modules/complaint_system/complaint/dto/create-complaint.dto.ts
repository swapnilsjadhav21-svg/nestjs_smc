import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateComplaintDto {

  @ApiProperty({ example: 1 })
  @IsNumber()
  citizen_id: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  complaint_type_id: number;

  @ApiProperty({ example: 'Garbage not collected' })
  @IsString()
  complaint: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  department_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  zone_id: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  prabhag_id: number;

  @ApiPropertyOptional({
    example: { latitude: 18.5204, longitude: 73.8567 },
  })
  @IsOptional()
  location?: {
    latitude: number;
    longitude: number;
  };
}