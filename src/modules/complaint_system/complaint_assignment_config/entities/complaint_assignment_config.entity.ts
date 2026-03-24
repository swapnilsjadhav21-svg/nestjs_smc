import { Entity, ManyToOne, JoinColumn } from "typeorm";
import { BaseTable } from "src/common/base.entity";
import { ComplaintType } from "../../complaint_type/entities/complaint_type.entity";
import { ComplaintAssignmentStrategy } from "../../complaint_assignment_strategy/entities/complaint_assignment_strategy.entity";
import { Designation } from "src/modules/reference_tables/designation/entities/designation.entity";
import { Department } from "src/modules/reference_tables/department/entities/department.entity";

@Entity('complaint_assignment_config')
export class ComplaintAssignmentConfig extends BaseTable{

    @ManyToOne(()=>ComplaintType)
    @JoinColumn({name:'complaint_type_id'})
    complaint_type:ComplaintType;

    @ManyToOne(()=>ComplaintAssignmentStrategy)
    @JoinColumn({name:'strategy_id'})
    strategy:ComplaintAssignmentStrategy;

    @ManyToOne(()=>Designation ,{nullable:true})
    @JoinColumn({name:'designation_id'})
    designation:Designation;

    @ManyToOne(()=>Department , {nullable:true})
    @JoinColumn({name:'department_id'})
    department:Department;

}