import { Entity, ManyToOne, JoinColumn , Column } from "typeorm";
import { BaseTable } from "src/common/base.entity";
import { Prabhag } from "src/modules/reference_tables/prabhag/entities/prabhag.entity";
import { Zone } from "src/modules/reference_tables/zone/entities/zone.entity";

@Entity("ref_prabhag_zone_mapping")
export class PrabhagZoneMapping extends BaseTable{
    @ManyToOne(()=>Prabhag)
    @JoinColumn({name:'prabhag_id'})
    prabhag:Prabhag

    @ManyToOne(()=>Zone)
    @JoinColumn({name:'zone_id'})
    zone:Zone

    @Column({type:'boolean',default:false})
    is_primary:boolean

}