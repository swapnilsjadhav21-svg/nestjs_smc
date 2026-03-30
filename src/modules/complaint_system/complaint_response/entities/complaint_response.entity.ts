import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';
import { Complaint } from '../../complaint/entities/complaint.entity';
import { AppUser } from 'src/modules/core_tables/app_user/entities/appUser.entity';
import { AppCitizen } from 'src/modules/core_tables/app-citizen/entities/appCitizen.entity';

@Entity('complaint_response')
export class ComplaintResponse extends BaseTable {
  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @Column({ type: 'text' })
  reply: string;

  @ManyToOne(() => AppUser, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: AppUser;

  @ManyToOne(() => AppCitizen, { nullable: true })
  @JoinColumn({ name: 'citizen_id' })
  citizen: AppCitizen;
}