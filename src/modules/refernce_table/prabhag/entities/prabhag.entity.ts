import { Entity, Column } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';
@Entity('ref_prabhag')
export class Prabhag extends BaseTable {
  @Column()
  name: string;
}