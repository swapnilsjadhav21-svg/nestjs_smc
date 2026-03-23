import { Entity, Column } from 'typeorm';
import { BaseTable } from '../../../common/base.entity';

@Entity('ref_department')
export class Department extends BaseTable {
  @Column()
  name: string;
}