import { DeepPartial, Repository } from 'typeorm';

export abstract class BaseCrudService<T extends object, CreateDto extends DeepPartial<T>> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(dto: CreateDto): Promise<T> {
    const entity = this.repository.create(dto);
    return this.repository.save(entity);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }
}
