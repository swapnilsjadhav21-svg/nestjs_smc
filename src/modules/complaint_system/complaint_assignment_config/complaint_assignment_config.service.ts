import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintAssignmentConfig } from './entities/complaint_assignment_config.entity';
import { CreateComplaintAssignmentConfigDto } from './dto/complaint-assignment-config.dto';

@Injectable()
export class ComplaintAssignmentConfigService extends BaseCrudService<ComplaintAssignmentConfig, CreateComplaintAssignmentConfigDto> {
  constructor(
    @InjectRepository(ComplaintAssignmentConfig)
    repository: Repository<ComplaintAssignmentConfig>,
  ) {
    super(repository);
  }

  override async create(dto: CreateComplaintAssignmentConfigDto): Promise<ComplaintAssignmentConfig> {
    // One complaint type should have only one config
    const existing = await this.repository.findOne({
      where: {
        complaint_type: { id: dto.complaint_type.id },
        is_deleted: false,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Config for complaint type ${dto.complaint_type.id} already exists`,
      );
    }

    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAllWithRelations(): Promise<ComplaintAssignmentConfig[]> {
    return this.repository.find({
      where: { is_deleted: false },
      relations: ['complaint_type', 'strategy', 'designation', 'department'],
    });
  }
}