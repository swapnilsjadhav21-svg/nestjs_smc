import { Injectable, NotFoundException } from '@nestjs/common';
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

  async upload(file: Express.Multer.File): Promise<GenMedia> {
    const entity = this.repository.create({
      file_path: file.path,      // path where multer saved the file on disk
      file_type: file.mimetype,  // e.g image/jpeg, image/png
    });
    return this.repository.save(entity);
  }

  override async findOne(id: number): Promise<GenMedia> {
    const media = await this.repository.findOne({
      where: { id, is_deleted: false },
    });

    if (!media) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }

    return media;
  }
}