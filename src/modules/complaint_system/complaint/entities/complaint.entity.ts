import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { BaseTable } from '../../../../common/base.entity';

import { AppUser } from '../../../core_tables/app_user/entities/appUser.entity';
import { ComplaintType } from '../../complaint_type/entities/complaint_type.entity';
import { AppCitizen } from '../../../core_tables/app-citizen/entities/appCitizen.entity';
import { Department } from '../../../reference_tables/department/entities/department.entity';
import { Zone } from '../../../reference_tables/zone/entities/zone.entity';
import { Prabhag } from '../../../reference_tables/prabhag/entities/prabhag.entity';

@Entity('complaint')
export class Complaint extends BaseTable {

  @ManyToOne(() => AppCitizen)
  @JoinColumn({ name: 'citizen_id' })
  citizen: AppCitizen;

  @ManyToOne(() => ComplaintType)
  @JoinColumn({ name: 'complaint_type_id' })
  complaint_type: ComplaintType;

  @Column({ type: 'text' })
  complaint: string;

  @Column({ type: 'varchar', length: 20 })
  status: string;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assigned_to: AppUser;

  @ManyToOne(() => Department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Zone)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @ManyToOne(() => Prabhag)
  @JoinColumn({ name: 'prabhag_id' })
  prabhag: Prabhag;

  // Location coordinates: {latitude, longitude}
  @Column({
    type: 'json',
    nullable: true,
  })
  location: { latitude: number; longitude: number } | null;
}