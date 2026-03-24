import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseTable } from "../../../../common/base.entity";
import { AppUser } from "../../app_user/entities/appUser.entity";
import { Role } from "../../../reference_tables/role/entities/role.entity";

@Entity('app_user_role')
export class AppUserRole extends BaseTable {
    @ManyToOne(()=>AppUser)
    @JoinColumn({name:'user_id'})
    appUser:AppUser;

    @ManyToOne(()=>Role)
    @JoinColumn({name:'role_id'})
    role:Role;
}