import { Entity, Column } from 'typeorm';
import { BaseTable } from '../../../../common/base.entity';

@Entity('ref_zone')
export class Zone extends BaseTable {
  @Column()
  name: string;
}