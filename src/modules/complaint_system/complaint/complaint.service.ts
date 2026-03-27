import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { ComplaintAssignmentConfigService } from '../complaint_assignment_config/complaint_assignment_config.service';
import { PrabhagZoneMappingService } from 'src/modules/reference_tables/prabhag_zone_mapping/prabhagZoneMapping.service';
import { AppUserService } from 'src/modules/core_tables/app_user/app_user.service';
import { AppUser } from 'src/modules/core_tables/app_user/entities/appUser.entity';
import { Zone } from 'src/modules/reference_tables/zone/entities/zone.entity';
import { Department } from 'src/modules/reference_tables/department/entities/department.entity';

// Status constants — single source of truth
export const ComplaintStatus = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  REOPENED: 'REOPENED',
  ESCALATED: 'ESCALATED',
} as const;

// Strategy constants matching your enum
const Strategy = {
  ZONE: 'ZONE',
  DEPARTMENT: 'DEPARTMENT',
} as const;

// Valid status transitions as per tech doc
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  [ComplaintStatus.NEW]: [ComplaintStatus.ASSIGNED],
  [ComplaintStatus.ASSIGNED]: [ComplaintStatus.IN_PROGRESS,ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED],
  [ComplaintStatus.IN_PROGRESS]: [ComplaintStatus.RESOLVED, ComplaintStatus.REJECTED],
  [ComplaintStatus.RESOLVED]: [ComplaintStatus.REOPENED],
  [ComplaintStatus.REJECTED]: [ComplaintStatus.ESCALATED],
};

@Injectable()
export class ComplaintService extends BaseCrudService<Complaint, CreateComplaintDto> {
  constructor(
    @InjectRepository(Complaint)
    repository: Repository<Complaint>,
    private readonly assignmentConfigService: ComplaintAssignmentConfigService,
    private readonly prabhagZoneMappingService: PrabhagZoneMappingService,
    private readonly appUserService: AppUserService,
  ) {
    super(repository);
  }

  override async create(dto: CreateComplaintDto): Promise<Complaint> {
    // Step 1 — Save complaint with status NEW
    const entity = this.repository.create({
      ...dto,
      status: ComplaintStatus.NEW,
    });
    const saved = await this.repository.save(entity);

    // Step 2 — Run assignment engine
    try {
      const assignedComplaint = await this.runAssignmentEngine(saved, dto);
      return assignedComplaint;
    } catch (error) {
      // If assignment fails, still return the complaint as NEW
      // Don't block complaint creation just because assignment failed
      console.error(`Assignment failed for complaint ${saved.id}:`, error.message);
      return saved;
    }
  }

  private async runAssignmentEngine(complaint: Complaint, dto: CreateComplaintDto): Promise<Complaint> {
    // Step 1 — Fetch config for this complaint type
    const configs = await this.assignmentConfigService.findAllWithRelations();
    const config = configs.find(
      (c) => c.complaint_type.id === dto.complaint_type.id && !c.is_deleted,
    );

    if (!config) {
      throw new BadRequestException(
        `No assignment config found for complaint type ${dto.complaint_type.id}`,
      );
    }

    const strategyCode = config.strategy.code;
    let assignedUser: AppUser | undefined = undefined;
    let assignedZone: Zone | undefined = undefined;
    let assignedDepartment: Department | undefined = undefined;

    if (strategyCode === Strategy.ZONE) {
      // Step 2a — ZONE strategy: find zone from prabhag mapping
      const mappings = await this.prabhagZoneMappingService.findAllWithRelations();

      // Prefer is_primary = true, fallback to any mapping
      const prabhagMappings = mappings.filter(
        (m) => m.prabhag.id === dto.prabhag.id && !m.is_deleted,
      );

      if (!prabhagMappings.length) {
        throw new BadRequestException(
          `No zone mapping found for prabhag ${dto.prabhag.id}`,
        );
      }

      const primaryMapping = prabhagMappings.find((m) => m.is_primary) ?? prabhagMappings[0];
      assignedZone = primaryMapping.zone;

      // Step 2b — Find active officer with matching designation in this zone
      const allUsers = await this.appUserService.findAllWithRelations();
      assignedUser = allUsers.find(
        (u) =>
          u.status === 'ACTIVE' &&
          !u.is_deleted &&
          u.designation?.id === config.designation?.id,
      );

      if (!assignedUser) {
        throw new BadRequestException(
          `No active officer found for designation ${config.designation?.id} in zone ${assignedZone.id}`,
        );
      }

    } else if (strategyCode === Strategy.DEPARTMENT) {
      // Step 2c — DEPARTMENT strategy: find active officer with matching department
      const allUsers = await this.appUserService.findAllWithRelations();
      assignedUser = allUsers.find(
        (u) =>
          u.status === 'ACTIVE' &&
          !u.is_deleted &&
          u.department?.id === config.department?.id,
      );

      if (!assignedUser) {
        throw new BadRequestException(
          `No active officer found for department ${config.department?.id}`,
        );
      }

      assignedDepartment = config.department;
    }

    // Step 3 — Update complaint with assigned officer and status ASSIGNED
    complaint.assigned_to = assignedUser!;
    complaint.status = ComplaintStatus.ASSIGNED;
    complaint.zone = assignedZone ?? complaint.zone;
    complaint.department = assignedDepartment ?? complaint.department;

    return this.repository.save(complaint);
  }

  async findAllWithRelations(): Promise<Complaint[]> {
    return this.repository.find({
      where: { is_deleted: false },
      relations: ['citizen', 'complaint_type', 'assigned_to', 'department', 'zone', 'prabhag'],
    });
  }

  override async findOne(id: number): Promise<Complaint> {
    const complaint = await this.repository.findOne({
      where: { id, is_deleted: false },
      relations: ['citizen', 'complaint_type', 'assigned_to', 'department', 'zone', 'prabhag'],
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with id ${id} not found`);
    }

    return complaint;
  }

  async updateStatus(id: number, newStatus: string, remarkText?: string): Promise<Complaint> {
    const complaint = await this.findOne(id);
    const currentStatus = complaint.status;

    // Enforce status transition rules from tech doc
    const allowed = ALLOWED_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Transition from ${currentStatus} to ${newStatus} is not allowed`,
      );
    }

    complaint.status = newStatus;
    return this.repository.save(complaint);
  }
}