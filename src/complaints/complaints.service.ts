import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Complaint } from './complaints.model';

@Injectable()
export class ComplaintsService {
    
    constructor(
        @InjectModel(Complaint)
        private complaintModel: typeof Complaint,
    ){}

    async createComplaint(data:any) {
        return await this.complaintModel.create(data);
    }

    async getAll() {
        return this.complaintModel.findAll();
    }

    async getOne(id:number) {

        const complaint = await this.complaintModel.findByPk(id);
        if(!complaint) throw new NotFoundException()
        else return complaint;
    } 

    async update(data:any, id:number) {
        const complaint =  await this.complaintModel.findByPk(id);
        if(complaint){
            return await complaint.update(data);
        }
    }

    async remove(id:number) {
        const complaint =  await this.complaintModel.findByPk(id);
        if(!complaint)  throw new NotFoundException();
        else return await complaint.destroy();
    }
}
