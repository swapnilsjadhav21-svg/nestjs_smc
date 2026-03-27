import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum AssignmentStrategyCode {
  ZONE = 'ZONE',
  DEPARTMENT = 'DEPARTMENT',
}

export class CreateComplaintAssignmentStrategyDto {
  @ApiProperty({ enum: AssignmentStrategyCode, example: AssignmentStrategyCode.ZONE })
  @IsEnum(AssignmentStrategyCode)
  code: AssignmentStrategyCode;
}