import { Entity, Column } from 'typeorm';
<<<<<<<< HEAD:src/modules/reference_tables/designation/entities/designation.entity.ts
import { BaseTable } from '../../../../common/base.entity';
========
import { BaseTable } from 'src/common/base.entity';
>>>>>>>> f0be9468057d03c2dcde1683e1bfa477ffde647e:src/modules/refernce_table/designation/entities/designation.entity.ts

@Entity('ref_designation')
export class Designation extends BaseTable {
  @Column()
  code: string;
  
  @Column()
  name: string;

  @Column()
  hierarchy_level: number;
}