import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { BaseTable } from '../../../../common/base.entity';

import { Complaint } from '../../complaint/entities/complaint.entity';
import { AppUser } from '../../../core_tables/app_user/entities/appUser.entity';
import { AppCitizen } from '../../../core_tables/app-citizen/entities/appCitizen.entity';

@Entity('complaint_history')
export class ComplaintHistory extends BaseTable {

  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ type: 'varchar', length: 20, nullable: true })
  old_status: string;

  @Column({ type: 'varchar', length: 20 })
  new_status: string;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn({ name: 'old_assigned_to' })
  old_assigned_to: AppUser;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn({ name: 'new_assigned_to' })
  new_assigned_to: AppUser;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn({ name: 'changed_by_user' })
  changed_by_user: AppUser;

  @ManyToOne(() => AppCitizen, { nullable: true })
  @JoinColumn({ name: 'changed_by_citizen' })
  changed_by_citizen: AppCitizen;

  @Column({ type: 'text', nullable: true })
  change_remark: string;
}