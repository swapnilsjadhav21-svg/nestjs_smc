import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { ComplaintResponse } from './entities/complaint_response.entity';
import { CreateComplaintResponseDto } from './dto/create-complaint-response.dto';
import { GenMedia } from '../gen_media/entities/gen_media.entity';
import { ComplaintResponseMedia } from '../complaint_response_media/entities/complaint_response_media.entity';
import * as fs from 'fs';

@Injectable()
export class ComplaintResponseService extends BaseCrudService<ComplaintResponse, CreateComplaintResponseDto> {
  constructor(
    @InjectRepository(ComplaintResponse)
    repository: Repository<ComplaintResponse>,
    private readonly dataSource: DataSource,
  ) {
    super(repository);
  }

  async createWithMedia(
    dto: CreateComplaintResponseDto,
    files?: Express.Multer.File[],
  ): Promise<ComplaintResponse> {
    return this.dataSource.transaction(async (manager) => {
      const response = manager.create(ComplaintResponse, {
        complaint: dto.complaint,
        reply: dto.reply,
        user: dto.user,
        citizen: dto.citizen,
      });

      const saved = await manager.save(ComplaintResponse, response);

      if (files && files.length > 0) {
        for (const file of files) {
          const folder = `uploads/complaints/${dto.complaint?.id}/responses/${saved.id}`;
          if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder, { recursive: true });
          }
          const newPath = `${folder}/${file.filename}`;
          fs.renameSync(file.path, newPath);

          const savedMedia = await manager.save(
            GenMedia,
            manager.create(GenMedia, {
              file_path: newPath,
              file_type: file.mimetype,
            }),
          );

          await manager.save(
            ComplaintResponseMedia,
            manager.create(ComplaintResponseMedia, {
              complaint_response: { id: saved.id },
              media: { id: savedMedia.id },
            }),
          );
        }
      }

      return saved;
    });
  }

  

  async findByComplaintId(complaintId: number): Promise<ComplaintResponse[]> {
    return this.repository.find({
      where: { complaint: { id: complaintId }, is_deleted: false },
      relations: ['complaint', 'user', 'citizen'],
      order: { created_at: 'ASC' },
    });
  }

  async findAllWithRelations(): Promise<ComplaintResponse[]> {
    return this.repository.find({
      where: { is_deleted: false },
      relations: ['complaint', 'user', 'citizen'],
    });
  }
}