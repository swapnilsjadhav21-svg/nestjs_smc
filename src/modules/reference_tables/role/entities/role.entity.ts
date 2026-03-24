import { Entity, Column } from 'typeorm';
<<<<<<<< HEAD:src/modules/reference_tables/role/entities/role.entity.ts
import { BaseTable } from '../../../../common/base.entity';
========
import { BaseTable } from 'src/common/base.entity';
>>>>>>>> f0be9468057d03c2dcde1683e1bfa477ffde647e:src/modules/refernce_table/role/entities/role.entity.ts

@Entity('ref_role')
export class Role extends BaseTable {
  @Column()
  code: string;

  @Column()
  name: string;
}