import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';

@Injectable()
export class ComplaintResponseService extends BaseCrudService<ComplaintResponse, CreateComplaintResponseDto> {
  constructor(
    @InjectRepository(ComplaintResponse)
    repository: Repository<ComplaintResponse>,
  ) {
    super(repository);
  }

  async findByComplaintId(complaintId: number): Promise<ComplaintResponse[]> {
    return this.repository.find({
      where: {
        complaint: { id: complaintId },
        is_deleted: false,
      },
      relations: ['complaint', 'user', 'citizen'],
      order: { created_at: 'ASC' },
    });
  }
}