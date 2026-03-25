import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint } from './entities/complaint.entity';
import { CreateComplaintDto } from './dto/create-complaint.dto';


@Injectable()
export class ComplaintService {
    constructor (
        @InjectRepository(Complaint)
        private readonly complaintRepo: Repository<Complaint>
    ){}

    async createComplaint(dto: CreateComplaintDto) {

  const complaint = this.complaintRepo.create({
    complaint: dto.complaint,
    status: 'Pending', // 🔥 IMPORTANT (as per flow)
    location: dto.location,

    citizen: { id: dto.citizen_id },
    complaint_type: { id: dto.complaint_type_id },
    department: { id: dto.department_id },
    zone: { id: dto.zone_id },
    prabhag: { id: dto.prabhag_id },
  });

  return await this.complaintRepo.save(complaint);
}
}
