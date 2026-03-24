import { Entity, Column } from 'typeorm';
<<<<<<<< HEAD:src/modules/reference_tables/prabhag/entities/prabhag.entity.ts
import { BaseTable } from '../../../../common/base.entity';

========
import { BaseTable } from 'src/common/base.entity';
>>>>>>>> f0be9468057d03c2dcde1683e1bfa477ffde647e:src/modules/refernce_table/prabhag/entities/prabhag.entity.ts
@Entity('ref_prabhag')
export class Prabhag extends BaseTable {
  @Column()
  name: string;
}