import { PrimaryGeneratedColumn, CreateDateColumn,UpdateDateColumn,Column } from "typeorm";

export abstract class BaseTable {
    @PrimaryGeneratedColumn()
    id:number;

    @CreateDateColumn()
    created_at:Date;

    @Column({nullable:true})
    created_by:Number;

    @UpdateDateColumn()
    updated_at:Date;

    @Column({nullable:true})
    updated_by:Number;

    @Column({default:false})
    is_deleted:boolean;

}