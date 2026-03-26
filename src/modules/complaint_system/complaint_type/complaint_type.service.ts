import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateComplainttypetDto } from './dto/create-complaint_type.dto';
import { ComplaintType } from './entities/complaint_type.entity';

@Injectable()
export class ComplaintTypeService extends BaseCrudService<ComplaintType> {
    constructor(
        @InjectRepository(ComplaintType)
        private readonly complainttypeRepo : Repository<ComplaintType>,
    ){
        super(complainttypeRepo);
    }
}

