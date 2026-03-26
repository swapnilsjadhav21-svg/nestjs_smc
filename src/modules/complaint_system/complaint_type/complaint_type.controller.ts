import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from 'src/common/crud/base-crud.controller';
import { CreateComplaintDto } from '../complaint/dto/create-complaint.dto';
import { ComplaintType } from './entities/complaint_type.entity';
import { ComplaintTypeService } from './complaint_type.service';
import { CreateComplainttypetDto } from './dto/create-complaint_type.dto';

@ApiTags('Complaint-Type')
@Controller('complaint-type')
export class ComplaintTypeController extends BaseCrudController<ComplaintType> {

    constructor(private readonly complainttypeService: ComplaintTypeService) {
        super(complainttypeService);
    }

    @Post()
    @ApiOperation({ summary: 'Create Complaint-Type' })
    override create(@Body() dto: CreateComplainttypetDto): Promise<ComplaintType> {
        return super.create(dto);
    }
}

