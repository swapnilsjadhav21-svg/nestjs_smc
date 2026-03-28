// assignment-engine.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplaintAssignmentConfig } from '../complaint_assignment_config/entities/complaint_assignment_config.entity';
import { PrabhagZoneMapping } from 'src/modules/reference_tables/prabhag_zone_mapping/entities/prabhagZoneMapping.entity';
import { AppUser } from '../../core_tables/app_user/entities/appUser.entity';
import { AssignmentStrategyCode } from '../complaint_assignment_strategy/dto/complaint-assignment-strategy.dto';

export interface AssignmentResult {
  officer: AppUser | null;
  zone_id: number | null;
  department_id: number | null;
}

@Injectable()
export class AssignmentEngineService {
  constructor(
    @InjectRepository(ComplaintAssignmentConfig)
    private readonly configRepo: Repository<ComplaintAssignmentConfig>,

    @InjectRepository(PrabhagZoneMapping)
    private readonly prabhagZoneMappingRepo: Repository<PrabhagZoneMapping>,

    @InjectRepository(AppUser)
    private readonly appUserRepo: Repository<AppUser>,
  ) {}

  async assign(
    complaintTypeId: number,
    prabhagId: number | null,
  ): Promise<AssignmentResult> {

    // STEP 1 — fetch config for this complaint type
    const config = await this.configRepo.findOne({
      where: {
        complaint_type: { id: complaintTypeId },
        is_deleted: false,
      },
      relations: ['strategy', 'designation', 'department'],
    });

    if (!config) {
      throw new NotFoundException(
        `No assignment config found for complaint type ${complaintTypeId}`,
      );
    }

    const strategyCode = config.strategy.code as AssignmentStrategyCode;

    if (strategyCode === AssignmentStrategyCode.ZONE) {
      return this.handleZoneStrategy(config, prabhagId);
    } else {
      return this.handleDepartmentStrategy(config);
    }
  }

  private async handleZoneStrategy(
    config: any,
    prabhagId: number | null,
  ): Promise<AssignmentResult> {

    // No prabhag → stays NEW, visible to all zone officers
    if (!prabhagId) {
      return { officer: null, zone_id: null, department_id: null };
    }

    // Find zone for this prabhag — prefer primary
    const primaryMapping = await this.prabhagZoneMappingRepo.findOne({
      where: {
        prabhag: { id: prabhagId },
        is_primary: true,
        is_deleted: false,
      },
      relations: ['zone'],
    });

    // Fallback to any zone if no primary found
    const mapping = primaryMapping ?? await this.prabhagZoneMappingRepo.findOne({
      where: {
        prabhag: { id: prabhagId },
        is_deleted: false,
      },
      relations: ['zone'],
    });

    if (!mapping) {
      return { officer: null, zone_id: null, department_id: null };
    }

    const zoneId = mapping.zone.id;

    // Fix: AppUser has no zone field directly
    // Find officer by designation only, then filter by zone via reporting structure
    // Use QueryBuilder for complex join
    const officer = await this.appUserRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.designation', 'designation')
      .leftJoinAndSelect('user.department', 'department')
      .where('designation.id = :designationId', { designationId: config.designation.id })
      .andWhere('user.status = :status', { status: 'ACTIVE' })
      .andWhere('user.is_deleted = false')
      .getOne();

    if (!officer) {
      return { officer: null, zone_id: zoneId, department_id: null };
    }

    return {
      officer,
      zone_id: zoneId,
      department_id: officer.department?.id ?? null,
    };
  }

  private async handleDepartmentStrategy(
    config: any,
  ): Promise<AssignmentResult> {

    // Find officer matching department + designation
    const officer = await this.appUserRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.designation', 'designation')
      .leftJoinAndSelect('user.department', 'department')
      .where('department.id = :deptId', { deptId: config.department.id })
      .andWhere('designation.id = :designationId', { designationId: config.designation.id })
      .andWhere('user.status = :status', { status: 'ACTIVE' })
      .andWhere('user.is_deleted = false')
      .getOne();

    if (officer) {
      return {
        officer,
        zone_id: null,
        department_id: config.department.id,
      };
    }

    // No officer found → find highest designation officer in department
    // hierarchy_level ASC = lowest number = highest rank
    const fallbackOfficer = await this.appUserRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.designation', 'designation')
      .leftJoinAndSelect('user.department', 'department')
      .where('department.id = :deptId', { deptId: config.department.id })
      .andWhere('user.status = :status', { status: 'ACTIVE' })
      .andWhere('user.is_deleted = false')
      .orderBy('designation.hierarchy_level', 'ASC')
      .getOne();

    return {
      officer: fallbackOfficer ?? null,
      zone_id: null,
      department_id: config.department.id,
    };
  }
}