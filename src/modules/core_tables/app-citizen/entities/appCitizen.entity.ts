import { Entity, Column } from "typeorm";
import { BaseTable } from "../../../../common/base.entity";

@Entity('app_citizen') 
export class AppCitizen extends BaseTable {
    @Column({ type: 'varchar'})
    mobile_no:string;
    
    @Column({ type: 'varchar', unique:true})
    name:string;
}