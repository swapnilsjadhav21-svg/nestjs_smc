import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseTable } from "../../../../common/base.entity";
import { Designation } from "../../../reference_tables/designation/entities/designation.entity";
import { Department } from "../../../reference_tables/department/entities/department.entity";

@Entity('app_user') 
export class AppUser extends BaseTable {
    @Column()
    employee_code:string;

    @Column({unique:true})
    mobile_no:string;

    @Column()
    name:string;

    @Column({nullable:true})
    name_marathi:string;

    @ManyToOne(()=>Designation)
    @JoinColumn({name:'designation_id'})
    designation:Designation;

    @ManyToOne(()=>Department)
    @JoinColumn({name:'department_id'})
    department:Department;

    @ManyToOne(()=>AppUser)
    @JoinColumn({name:'reporting_to'})
    reporting_to:AppUser;

    @Column()
    status:string;

    @Column({ type:'boolean', default:true})
    is_system_user: boolean;
}