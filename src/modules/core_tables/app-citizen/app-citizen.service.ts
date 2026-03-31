import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCitizen } from './entities/appCitizen.entity';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { CreateAppCitizenDto } from './dto/app_citizen.dto';


@Injectable()
export class AppCitizenService extends BaseCrudService<AppCitizen, CreateAppCitizenDto> {
    constructor(
        @InjectRepository(AppCitizen)
        private readonly appCitizenRepo: Repository<AppCitizen>,
    ) {
        super(appCitizenRepo);
    }

    override async create(dto: CreateAppCitizenDto): Promise<AppCitizen> {
        const existing = await this.repository.findOne({
            where: { mobile_no: dto.mobile_no, is_deleted: false },
        });

        if (existing) {
            throw new ConflictException(
                `Citizen with mobile number ${dto.mobile_no} already exists`,
            );
        }

        return super.create(dto);
    }
}