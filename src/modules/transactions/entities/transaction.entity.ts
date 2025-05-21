import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Payment } from '@modules/payments/entities/payment.entity';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  internal_id: string; // Internal primary key for flexibility

  @Column({ unique: true })
  id: number; // SePay transaction ID

  @Column()
  gateway: string;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column()
  accountNumber: string;

  @Column({ nullable: true })
  code: string;

  @Column()
  content: string;

  @Column()
  transferType: 'in' | 'out';

  @Column({ type: 'bigint' })
  transferAmount: number;

  @Column({ type: 'bigint' })
  accumulated: number;

  @Column({ nullable: true })
  subAccount: string;

  @Column()
  referenceCode: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToOne(() => Payment, (payment) => payment.transaction)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
