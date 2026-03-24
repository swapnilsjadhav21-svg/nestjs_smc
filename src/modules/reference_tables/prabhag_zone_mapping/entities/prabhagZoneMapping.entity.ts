import { Entity, ManyToMany, JoinColumn, Column, ManyToOne } from 'typeorm';
import { BaseTable } from '../../../../common/base.entity';
import { Prabhag } from '../../prabhag/entities/prabhag.entity';
import { Zone } from '../../zone/entities/zone.entity';

@Entity('ref_prabhag_zone_mapping')
export class PrabhagZoneMapping extends BaseTable {
  @ManyToOne(()=>Prabhag) // on prabhag can have many entries in this tables
  @JoinColumn({name: 'prabhag_id'}) // cerates a column named prabhag_id and links it as foreign key
  prabhag:Prabhag;

  @ManyToOne(()=>Zone)
  @JoinColumn({name:'zone_id'})
  zone:Zone;

  @Column({type:'boolean', default:false})
  is_primary:boolean;

}