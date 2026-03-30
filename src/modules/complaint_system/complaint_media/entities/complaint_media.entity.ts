import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';
import { Complaint } from '../../complaint/entities/complaint.entity';
import { GenMedia } from '../../gen_media/entities/gen_media.entity';

@Entity('complaint_media')
export class ComplaintMedia extends BaseTable {
  @ManyToOne(() => Complaint)
  @JoinColumn({ name: 'complaint_id' })
  complaint: Complaint;

  @ManyToOne(() => GenMedia)
  @JoinColumn({ name: 'media_id' })
  media: GenMedia;
}