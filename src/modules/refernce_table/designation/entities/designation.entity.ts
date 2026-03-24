import { Entity, Column } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';

@Entity('ref_designation')
export class Designation extends BaseTable {
  @Column()
  code: string;
  
  @Column()
  name: string;

  @Column()
  hierarchy_level: number;
}