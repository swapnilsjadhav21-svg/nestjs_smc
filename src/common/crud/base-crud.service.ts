import { NotFoundException } from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

export abstract class BaseCrudService<
  T extends { id: number },
  CreateDto extends DeepPartial<T>,
> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(dto: CreateDto): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async findOne(id: number): Promise<T> {
    const record = await this.repository.findOneBy({ id } as FindOptionsWhere<T>);

    if (!record) {
      throw new NotFoundException(`Record with id ${id} not found`);
    }

    return record;
  }
}
