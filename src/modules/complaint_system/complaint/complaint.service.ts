// complaint.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintStatusDto } from './dto/update-complaint-status.dto';
import { ReassignComplaintDto } from './dto/reassign-complaint.dto';
import { AssignmentEngineService } from './assignment-engine.service';
import { ComplaintStatus } from './enums/complaint-status.enum';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { Zone } from '../../reference_tables/zone/entities/zone.entity';
import { Department } from '../../reference_tables/department/entities/department.entity';

const ALLOWED_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  [ComplaintStatus.NEW]:         [ComplaintStatus.ASSIGNED],
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

    private readonly assignmentEngine: AssignmentEngineService,
  ) {}

  async create(dto: CreateComplaintDto, citizenId: number): Promise<Complaint> {

    // Fix: Build entity object explicitly with correct types
    // Use undefined instead of null for optional relations
    const complaint = this.complaintRepo.create({
      citizen: { id: citizenId },
      complaint_type: { id: dto.complaint_type.id },
      complaint: dto.complaint,
      status: ComplaintStatus.NEW,
      prabhag: dto.prabhag ? { id: dto.prabhag.id } : undefined,
      location: dto.location ?? undefined,
    } as Complaint);  // explicit cast resolves overload ambiguity

    const saved = await this.complaintRepo.save(complaint);

    // Run assignment engine
    const result = await this.assignmentEngine.assign(
      dto.complaint_type.id,
      dto.prabhag?.id ?? null,
    );

    // Fix: assign relations using Object.assign to avoid type errors
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

    return this.complaintRepo.save(saved);
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

  async updateStatus(
    complaintId: number,
    dto: UpdateComplaintStatusDto,
    officerId: number,
  ): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);
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

  async reassign(
    complaintId: number,
    dto: ReassignComplaintDto,
    officerId: number,
  ): Promise<Complaint> {
    const complaint = await this.findOne(complaintId);

    const officer = new AppUser();
    officer.id = dto.assigned_to_id;
    complaint.assigned_to = officer;

    // If complaint was NEW (unassigned), mark it ASSIGNED now
    if (complaint.status === ComplaintStatus.NEW) {
      complaint.status = ComplaintStatus.ASSIGNED;
    }

    return this.complaintRepo.save(complaint);
  }
}