import { Entity, Column } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';

@Entity('ref_role')
export class Role extends BaseTable {
  @Column()
  code: string;

  @Column()
  name: string;
}