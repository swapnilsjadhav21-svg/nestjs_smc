import { Entity, Column } from "typeorm";
import { BaseTable } from "src/common/base.entity";

@Entity('complaint_type')
export class ComplaintType extends BaseTable{
    @Column()
    name:string
}