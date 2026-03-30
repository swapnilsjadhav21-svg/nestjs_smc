import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintResponseMedia } from './entities/complaint_response_media.entity';
import { CreateComplaintResponseMediaDto } from './dto/complaint-response-media.dto';

@Injectable()
export class ComplaintResponseMediaService extends BaseCrudService<ComplaintResponseMedia, CreateComplaintResponseMediaDto> {
  constructor(
    @InjectRepository(ComplaintResponseMedia)
    repository: Repository<ComplaintResponseMedia>,
  ) {
    super(repository);
  }

  async findByResponseId(responseId: number): Promise<ComplaintResponseMedia[]> {
    return this.repository.find({
      where: {
        complaint_response: { id: responseId },
        is_deleted: false,
      },
      relations: ['complaint_response', 'media'],
    });
  }
}