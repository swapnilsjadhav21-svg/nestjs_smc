import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { GenMedia } from './entities/gen_media.entity';
import { CreateGenMediaDto } from './dto/create-gen-media.dto';

@Injectable()
export class GenMediaService extends BaseCrudService<GenMedia, CreateGenMediaDto> {
  constructor(
    @InjectRepository(GenMedia)
    repository: Repository<GenMedia>,
  ) {
    super(repository);
  }
}