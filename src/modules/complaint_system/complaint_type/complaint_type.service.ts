import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Repository } from 'typeorm';
import { CreateComplainttypetDto } from './dto/create-complaint_type.dto';
import { ComplaintType } from './entities/complaint_type.entity';

@Injectable()
export class ComplaintTypeService extends BaseCrudService<ComplaintType, CreateComplainttypetDto> {
    constructor(
        @InjectRepository(ComplaintType)
        complainttypeRepo : Repository<ComplaintType>,
    ){
        super(complainttypeRepo);
    }

    override async create(dto: CreateComplainttypetDto): Promise<ComplaintType> {
        const existing = await this.repository.findOne({
            where: { name: dto.name, is_deleted: false },
        });

        if (existing) {
            throw new ConflictException(`${dto.name} already exists`);
        }

        return super.create(dto);
    }
}

