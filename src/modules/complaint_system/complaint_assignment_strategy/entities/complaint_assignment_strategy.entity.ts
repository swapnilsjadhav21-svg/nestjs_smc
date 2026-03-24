import { Entity,Column } from "typeorm";
import { BaseTable } from "src/common/base.entity";

@Entity('complaint_assignment_strategy')
export class ComplaintAssignmentStrategy extends BaseTable{
    @Column({type:"varchar"})
    code:string
}