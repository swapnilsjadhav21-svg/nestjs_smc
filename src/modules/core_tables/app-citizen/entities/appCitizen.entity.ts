import { Entity, Column } from "typeorm";
import { BaseTable } from "../../../../common/base.entity";

@Entity('app_citizen') 
export class AppCitizen extends BaseTable {
    @Column({ type: 'varchar', unique: true})
    mobile_no:string;
    
    @Column({ type: 'varchar', unique:true, nullable: true})
    name:string;

    @Column({ nullable: true})
    address:string;
    
    @Column({ nullable: true})
    email:string;
}