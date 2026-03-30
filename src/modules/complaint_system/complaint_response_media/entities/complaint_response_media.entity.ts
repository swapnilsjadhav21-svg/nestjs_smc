import { Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';
import { ComplaintResponse } from '../../complaint_response/entities/complaint_response.entity';
import { GenMedia } from '../../gen_media/entities/gen_media.entity';

@Entity('complaint_response_media')
export class ComplaintResponseMedia extends BaseTable {
  @ManyToOne(() => ComplaintResponse)
  @JoinColumn({ name: 'complaint_response_id' })
  complaint_response: ComplaintResponse;

  @ManyToOne(() => GenMedia)
  @JoinColumn({ name: 'media_id' })
  media: GenMedia;
}