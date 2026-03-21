import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class updateComplaintDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    title:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    complaint_type:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    description:string;

    @IsString()
    @IsNotEmpty()
    @IsOptional()
    status:string;
}