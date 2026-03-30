import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintMedia } from './entities/complaint_media.entity';
import { CreateComplaintMediaDto } from './dto/create-complaint-media.dto';

@Injectable()
export class ComplaintMediaService extends BaseCrudService<ComplaintMedia, CreateComplaintMediaDto> {
  constructor(
    @InjectRepository(ComplaintMedia)
    repository: Repository<ComplaintMedia>,
  ) {
    super(repository);
  }

  async findByComplaintId(complaintId: number): Promise<ComplaintMedia[]> {
    return this.repository.find({
      where: {
        complaint: { id: complaintId },
        is_deleted: false,
      },
      relations: ['complaint', 'media'],
    });
  }
}