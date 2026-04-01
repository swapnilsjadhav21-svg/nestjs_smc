// complaint.service.ts
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ReassignComplaintDto } from './dto/reassign-complaint.dto';
import { AssignmentEngineService } from './assignment-engine.service';
import { ComplaintStatus } from './enums/complaint-status.enum';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { Zone } from '../../reference_tables/zone/entities/zone.entity';
import { Department } from '../../reference_tables/department/entities/department.entity';
import { ComplaintType } from '../complaint_type/entities/complaint_type.entity';
import { Prabhag } from '../../reference_tables/prabhag/entities/prabhag.entity';
import { GenMediaService } from '../gen_media/gen_media.service';
import { ComplaintMediaService } from '../complaint_media/complaint_media.service';
import { GenMedia } from '../gen_media/entities/gen_media.entity';
import { ComplaintMedia } from '../complaint_media/entities/complaint_media.entity';

const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.NEW]:         [ComplaintStatus.ASSIGNED, ComplaintStatus.IN_PROGRESS],
  [ComplaintStatus.ASSIGNED]:    [ComplaintStatus.IN_PROGRESS],
  [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED],
  [ComplaintStatus.RESOLVED]:    [ComplaintStatus.REOPENED],
  [ComplaintStatus.REJECTED]:    [ComplaintStatus.ESCALATED],
  [ComplaintStatus.REOPENED]:    [ComplaintStatus.ASSIGNED],
  [ComplaintStatus.ESCALATED]:   [],
};

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private readonly complaintRepo: Repository<Complaint>,
    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,

    private readonly genMediaService: GenMediaService,
    private readonly complaintMediaService: ComplaintMediaService,
    private readonly assignmentEngine: AssignmentEngineService,
    private readonly dataSource: DataSource,
  ) {}

  async findWithFilters(filters: {
    zone_id?: number;
    prabhag_id?: number;
    department_id?: number;
    assigned_to?: number;
    citizen_id?: number;
    complaint_type_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ data: Complaint[]; total: number; page: number; page_size: number }> {
    const page = filters.page ?? 1;
    const page_size = filters.page_size ?? 50;
    const skip = (page - 1) * page_size;

    const where: FindOptionsWhere<Complaint> = { is_deleted: false };

    if (filters.status) where.status = filters.status;
    if (filters.zone_id) where.zone = { id: filters.zone_id };
    if (filters.prabhag_id) where.prabhag = { id: filters.prabhag_id };
    if (filters.department_id) where.department = { id: filters.department_id };
    if (filters.assigned_to) where.assigned_to = { id: filters.assigned_to };
    if (filters.citizen_id) where.citizen = { id: filters.citizen_id };
    if (filters.complaint_type_id) where.complaint_type = { id: filters.complaint_type_id };

    if (filters.start_date && filters.end_date) {
      where.created_at = Between(
        new Date(filters.start_date),
        new Date(filters.end_date),
      );
    }

    const [data, total] = await this.complaintRepo.findAndCount({
      where,
      relations: ['citizen', 'complaint_type', 'assigned_to', 'department', 'zone', 'prabhag'],
      skip,
      take: page_size,
      order: { created_at: 'DESC' },
    });

    return { data, total, page, page_size };
  }

  async create(
    dto: CreateComplaintDto,
    citizenId: number,
    files?: Express.Multer.File[],
  ): Promise<Complaint> {
    const complaintType = await this.complaintRepo.manager.findOne(ComplaintType, {
      where: { id: dto.complaint_type.id, is_deleted: false },
    });

    if (!complaintType) {
      throw new NotFoundException(
        `Complaint type with id ${dto.complaint_type.id} not found`,
      );
    }

    if (dto.prabhag) {
      const prabhag = await this.complaintRepo.manager.findOne(Prabhag, {
        where: { id: dto.prabhag.id, is_deleted: false },
      });

      if (!prabhag) {
        throw new NotFoundException(`Prabhag with id ${dto.prabhag.id} not found`);
      }
    }

    return this.dataSource.transaction(async (manager) => {
      const complaint = manager.create(Complaint, {
        citizen: { id: citizenId },
        complaint_type: { id: dto.complaint_type.id },
        complaint: dto.complaint,
        status: ComplaintStatus.NEW,
        prabhag: dto.prabhag ? { id: dto.prabhag.id } : undefined,
        location: dto.location ?? undefined,
      } as Complaint);

      const saved = await manager.save(Complaint, complaint);

      const result = await this.assignmentEngine.assign(
        dto.complaint_type.id,
        dto.prabhag?.id ?? null,
      );

      if (result.officer) {
        saved.assigned_to = result.officer;
        saved.status = ComplaintStatus.ASSIGNED;
      }

      if (result.zone_id) {
        const zone = new Zone();
        zone.id = result.zone_id;
        saved.zone = zone;
      }

      if (result.department_id) {
        const department = new Department();
        department.id = result.department_id;
        saved.department = department;
      }

      await manager.save(Complaint, saved);

      if (files && files.length > 0) {
        const fs = require('fs');
        for (const file of files) {
          const folder = `uploads/complaints/${saved.id}`;
          if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
          const newPath = `${folder}/${file.filename}`;
          fs.renameSync(file.path, newPath);
          const savedMedia = await manager.save(
            GenMedia,
            manager.create(GenMedia, { file_path: newPath, file_type: file.mimetype }),
          );
          await manager.save(
            ComplaintMedia,
            manager.create(ComplaintMedia, {
              complaint: { id: saved.id },
              media: { id: savedMedia.id },
            }),
          );
        }
      }
      return saved;
    });
  }

  async findMyCitizenComplaints(citizenId: number): Promise<Complaint[]> {
    return this.complaintRepo.find({
      where: { citizen: { id: citizenId }, is_deleted: false },
      relations: ['complaint_type', 'assigned_to', 'zone', 'prabhag'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Complaint> {
    const complaint = await this.complaintRepo.findOne({
      where: { id, is_deleted: false },
      relations: [
        'citizen', 'complaint_type', 'assigned_to',
        'department', 'zone', 'prabhag',
      ],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with id ${id} not found`);
    }

    return complaint;
  }

  async findAssignedComplaints(officerId: number): Promise<Complaint[]> {
    return this.complaintRepo.find({
      where: { assigned_to: { id: officerId }, is_deleted: false },
      relations: ['complaint_type', 'citizen', 'zone', 'prabhag'],
      order: { created_at: 'DESC' },
    });
  }

  async findTeamComplaints(officerId: number): Promise<Complaint[]> {
    const officer = await this.appUserRepo.findOne({
      where: { id: officerId, is_deleted: false },
      relations: ['department'],
    });

    if (!officer) {
      throw new NotFoundException(`Officer with id ${officerId} not found`);
    }

    if (!officer.department) {
      throw new BadRequestException(
        `Officer ${officerId} is not assigned to any department`,
      );
    }

    return this.complaintRepo
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.complaint_type', 'complaint_type')
      .leftJoinAndSelect('complaint.assigned_to', 'assigned_to')
      .leftJoinAndSelect('assigned_to.department', 'department')
      .leftJoinAndSelect('complaint.zone', 'zone')
      .where(
        `department.id = (SELECT u.department_id FROM app_user u WHERE u.id = :officerId)`,
        { officerId },
      )
      .andWhere('complaint.is_deleted = false')
      .orderBy('complaint.created_at', 'DESC')
      .getMany();
  }

  async claimComplaint(complaintId: number, officerId: number): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);

    if (complaint.status !== ComplaintStatus.NEW) {
      throw new BadRequestException(
        `Only NEW complaints can be claimed. Current status: ${complaint.status}`,
      );
    }

    if (complaint.assigned_to) {
      throw new BadRequestException(`Complaint is already assigned to an officer`);
    }

    const officer = new AppUser();
    officer.id = officerId;
    complaint.assigned_to = officer;
    complaint.status = ComplaintStatus.ASSIGNED;

    return this.complaintRepo.save(complaint);
  }

  async updateStatusByOfficer(
    complaintId: number,
    dto: UpdateComplaintStatusDto,
    officerId: number,
  ): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);

    if (complaint.assigned_to?.id !== officerId) {
      throw new ForbiddenException(
        'You can only update status of complaints assigned to you',
      );
    }

    const currentStatus = complaint.status as ComplaintStatus;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNext.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${dto.status}. Allowed: ${allowedNext.join(', ')}`,
      );
    }

    complaint.status = dto.status;
    return this.complaintRepo.save(complaint);
  }

  async updateStatusByCitizen(
    complaintId: number,
    status: ComplaintStatus,
    citizenId: number,
  ): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);

    if (complaint.citizen?.id !== citizenId) {
      throw new ForbiddenException(
        'You can only update your own complaints',
      );
    }

    const allowedForCitizen = [ComplaintStatus.REOPENED, ComplaintStatus.ESCALATED];
    if (!allowedForCitizen.includes(status)) {
      throw new BadRequestException(
        'Citizens can only reopen or escalate complaints',
      );
    }

    const currentStatus = complaint.status as ComplaintStatus;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus];

    if (!allowedNext.includes(status)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${status}. Allowed: ${allowedNext.join(', ')}`,
      );
    }

    complaint.status = status;
    return this.complaintRepo.save(complaint);
  }

  async reassign(
    complaintId: number,
    dto: ReassignComplaintDto,
    officerId: number,
  ): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);

    const newOfficer = await this.appUserRepo.findOne({
      where: { id: dto.assigned_to_id, status: 'ACTIVE', is_deleted: false },
    });

    if (!newOfficer) {
      throw new NotFoundException(
        `Active officer with id ${dto.assigned_to_id} not found`,
      );
    }

    complaint.assigned_to = newOfficer;

    // If complaint was NEW (unassigned), mark it ASSIGNED now
    if (complaint.status === ComplaintStatus.NEW) {
      complaint.status = ComplaintStatus.ASSIGNED;
    }

    return this.complaintRepo.save(complaint);
  }
}