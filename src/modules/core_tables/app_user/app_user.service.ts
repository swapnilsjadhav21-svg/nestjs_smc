import { Injectable, BadRequestException } from '@nestjs/common';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { AppUser } from './entities/appUser.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppUserDto } from './dto/appUser.dto';
import { Designation } from '../../reference_tables/designation/entities/designation.entity';
import { Department } from '../../reference_tables/department/entities/department.entity';

@Injectable()
export class AppUserService extends BaseCrudService<AppUser> {
  constructor(
    @InjectRepository(AppUser)
    private appUserRepo: Repository<AppUser>,
    @InjectRepository(Designation)
    private designationRepo: Repository<Designation>,
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
  ) {
    super(appUserRepo);
  }

  async createAppUser(dto: CreateAppUserDto) {
    // Validate that designation exists
    const designation = await this.designationRepo.findOneBy({ id: dto.designation_id });
    if (!designation) {
      throw new BadRequestException(`Designation with ID ${dto.designation_id} not found`);
    }

    // Validate that department exists
    const department = await this.departmentRepo.findOneBy({ id: dto.department_id });
    if (!department) {
      throw new BadRequestException(`Department with ID ${dto.department_id} not found`);
    }

    // Validate reporting_to user exists if provided
    if (dto.reporting_to) {
      const reportingToUser = await this.appUserRepo.findOneBy({ id: dto.reporting_to });
      if (!reportingToUser) {
        throw new BadRequestException(`User with ID ${dto.reporting_to} not found for reporting_to`);
      }
    }

    return super.create({
      employee_code: dto.employee_code,
      mobile_no: dto.mobile_number,
      name: dto.name,
      name_marathi: dto.name_marathi,
      status: dto.status,
      is_system_user: dto.is_system_user,

      designation: { id: dto.designation_id },
      department: { id: dto.department_id },

      reporting_to: dto.reporting_to
        ? { id: dto.reporting_to }
        : undefined,
    });
  }
}
