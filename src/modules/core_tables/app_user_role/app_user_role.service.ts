// app-user-role.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { AppUserRole } from './entities/appUserRole.entity';
import { CreateAppUserRoleDto } from './dto/create-app-user-role.dto';

@Injectable()
export class AppUserRoleService extends BaseCrudService<AppUserRole, CreateAppUserRoleDto> {
  constructor(
    @InjectRepository(AppUserRole)
    repository: Repository<AppUserRole>,
  ) {
    super(repository);
  }

  override async create(dto: CreateAppUserRoleDto): Promise<AppUserRole> {
    // Check if this user-role combo already exists
    const existing = await this.repository.findOne({
      where: {
        appUser: { id: dto.appUser.id },
        role: { id: dto.role.id },
        is_deleted: false,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `User ${dto.appUser.id} already has role ${dto.role.id}`,
      );
    }

    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  // GET all mappings with full nested details
  async findAllWithRelations(): Promise<AppUserRole[]> {
    return this.repository.find({
      where: { is_deleted: false },
      relations: ['appUser', 'role'],
    });
  }

  // GET all roles for a specific user with full nested details
  async findRolesByUserId(userId: number): Promise<AppUserRole[]> {
    const mappings = await this.repository.find({
      where: {
        appUser: { id: userId },
        is_deleted: false,
      },
      relations: ['appUser', 'role'],
    });

    // If user exists but has no roles, return empty array — not a 404
    // 404 should only be thrown if the userId itself is invalid
    return mappings;
  }

  // Soft delete — remove a role from user
  async removeUserRole(id: number): Promise<{ message: string }> {
    const mapping = await this.repository.findOne({
      where: { id, is_deleted: false },
    });

    if (!mapping) {
      throw new NotFoundException(`User role mapping with id ${id} not found`);
    }

    // No hard deletes as per tech doc — just set is_deleted = true
    mapping.is_deleted = true;
    await this.repository.save(mapping);

    return { message: `Role mapping ${id} removed successfully` };
  }
}