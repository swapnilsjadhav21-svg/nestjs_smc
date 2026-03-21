import { table } from "console";
import { Table,Column, Model, DataType } from "sequelize-typescript";

@Table
export class Complaint extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    title: string;

    @Column({
        type: DataType.STRING,
        allowNull:false,
    })
    complaint_type: string;
    
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    description: string;

    @Column({
        type: DataType.STRING,
        allowNull:false,
    })
    status: string;
}