import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaints } from './complaint.model';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaints)
    private readonly complaintRepository: Repository<Complaints>,
  ) {}

  async findAll() {
    return await this.complaintRepository.find();
  }

  async findOne(id: string) {
    return await this.complaintRepository.findOne({ where: { id } });
  }

  async create(complaint: Partial<Complaints>) {
    const newComplaint = this.complaintRepository.create(complaint);
    return await this.complaintRepository.save(newComplaint);
  }

  async update(id: string, complaint: Partial<Complaints>) {
    await this.complaintRepository.update(id, complaint);
    return await this.complaintRepository.findOne({ where: { id } });
  }

  async delete(id: string) {
    return await this.complaintRepository.delete(id);
  }
}
