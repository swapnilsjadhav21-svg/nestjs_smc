import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseTable } from '../../../../common/base.entity';

import { Complaint } from '../../complaint/entities/complaint.entity';

@Entity('complaint_media')
export class ComplaintMedia extends BaseTable {

  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ type: 'varchar', length: 255 })
  file_path: string;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;
}