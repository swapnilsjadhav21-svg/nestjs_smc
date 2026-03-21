import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class createComplaintDto {
    @IsString()
    @IsNotEmpty()
    title:string;

    @IsString()
    @IsNotEmpty()
    complaint_type:string;

    @IsString()
    @IsNotEmpty()
    description:string;

    @IsString()
    @IsNotEmpty()
    status:string;
}
