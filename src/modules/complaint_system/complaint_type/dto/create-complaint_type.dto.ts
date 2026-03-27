import { ApiProperty } from '@nestjs/swagger';
import { IsString , IsNotEmpty} from 'class-validator';

export class CreateComplainttypetDto {
  @ApiProperty({ example: 'Road - Pothole repair ' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
