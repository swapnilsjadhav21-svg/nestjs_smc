import { Entity, Column } from 'typeorm';
import { BaseTable } from 'src/common/base.entity';

@Entity('gen_media')
export class GenMedia extends BaseTable {
  @Column({ type: 'varchar' })
  file_path: string;

  @Column({ type: 'varchar' })
  file_type: string;
}