import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity('payment_logs')
export class PaymentLogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Payment, { nullable: false })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    type: 'enum',
    enum: ['INITIATED', 'WEBHOOK_RECEIVED', 'STATUS_UPDATED', 'ERROR'],
    nullable: false,
  })
  event_type: 'INITIATED' | 'WEBHOOK_RECEIVED' | 'STATUS_UPDATED' | 'ERROR';

  @Column({ type: 'json', nullable: true })
  payload: any;

  @CreateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
