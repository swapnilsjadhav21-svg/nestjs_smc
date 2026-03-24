import { Entity, Column } from 'typeorm';
<<<<<<<< HEAD:src/modules/reference_tables/department/entities/department.entity.ts
import { BaseTable } from '../../../../common/base.entity';
========
import { BaseTable } from 'src/common/base.entity';
>>>>>>>> f0be9468057d03c2dcde1683e1bfa477ffde647e:src/modules/refernce_table/department/entities/department.entity.ts

@Entity('ref_department')
export class Department extends BaseTable {
  @Column()
  name: string;
}