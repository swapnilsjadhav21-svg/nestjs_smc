// app-user.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from 'src/common/crud/base-crud.service';
import { AppUser } from './entities/appUser.entity';
import { CreateAppUserDto } from './dto/create-app-user.dto';
import { UpdateAppUserDto, UpdateUserStatusDto } from './dto/update-app-user.dto';

@Injectable()
export class AppUserService extends BaseCrudService<AppUser, CreateAppUserDto> {
  constructor(
    @InjectRepository(AppUser)
    repository: Repository<AppUser>,
  ) {
    super(repository);
  }


  
  override async create(dto: CreateAppUserDto): Promise<AppUser> {
    const existing = await this.repository.findOne({
      where: { mobile_no: dto.mobile_no, is_deleted: false },
    });

    if (existing) {
      throw new BadRequestException(
        `User with mobile number ${dto.mobile_no} already exists`,
      );
    }

    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAllWithRelations(): Promise<AppUser[]> {
    return this.repository.find({
      where: { is_deleted: false },
      relations: ['designation', 'department', 'reporting_to'],
    });
  }

  override async findOne(id: number): Promise<AppUser> {
    const user = await this.repository.findOne({
      where: { id, is_deleted: false },
      relations: ['designation', 'department', 'reporting_to'],
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  async update(id: number, dto: UpdateAppUserDto): Promise<AppUser> {
    const user = await this.findOne(id);

    if (dto.mobile_no && dto.mobile_no !== user.mobile_no) {
      const mobileExists = await this.repository.findOne({
        where: { mobile_no: dto.mobile_no, is_deleted: false },
      });

      if (mobileExists) {
        throw new BadRequestException(
          `Mobile number ${dto.mobile_no} is already in use`,
        );
      }
    }

    Object.assign(user, dto);
    return this.repository.save(user);
  }

  async updateStatus(id: number, dto: UpdateUserStatusDto): Promise<AppUser> {
    const user = await this.findOne(id);
    user.status = dto.status;
    return this.repository.save(user);
  }
}