import { Controller, Body, Post, Get,Param, Put, Delete } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { createComplaintDto } from './dto/createComplaintDto.dto';
import { updateComplaintDto } from './dto/updateComplaintDto.dto';


@Controller('complaints')
export class ComplaintsController {

    constructor(private readonly complaintsService: ComplaintsService){};

    @Post()
    createComplaint(@Body()  body:createComplaintDto ){
        return this.complaintsService.createComplaint(body);
    }

    @Get()
    getAllComplaint() {
        return this.complaintsService.getAll();
    }

    @Get(":id") 
    getOneComplaint(@Param("id") id:string) {
        return this.complaintsService.getOne(Number(id));
    }
    
    @Put(":id")
    updateComplaint(@Body() body:updateComplaintDto ,@Param("id")id:string) {
        return this.complaintsService.update(body,Number(id));
    }

    @Delete(":id") 
        deleteComplaint(@Param("id") id:string) {
            return this.complaintsService.remove(Number(id));
        }
    
}
