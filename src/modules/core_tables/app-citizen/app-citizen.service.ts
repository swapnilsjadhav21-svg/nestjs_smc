import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCitizen } from './entities/appCitizen.entity';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { CreateAppCitizenDto } from './dto/app_citizen.dto';


@Injectable()
export class AppCitizenService extends BaseCrudService<AppCitizen> {
    constructor(
        @InjectRepository(AppCitizen)
        private readonly appCitizenRepo: Repository<AppCitizen>,
    ) {
        super(appCitizenRepo);
    }
}