// app-otp/entities/app-otp.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('app_otp')
export class AppOtp {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  mobile_number: string;

  @Column({ type: 'int' })
  otp: number;

  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'timestamp' })
  expire_at: Date;

  @Column({ type: 'boolean', default: false })
  expired: boolean;
}