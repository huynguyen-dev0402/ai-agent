import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { TransactionEntity } from '@modules/transactions/entities/transaction.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => UserSubscriptions,
    (userSubscription) => userSubscription.payments,
  )
  @JoinColumn({ name: 'user_subscription_id' })
  user_subscriptions: UserSubscriptions;

  @ManyToOne(() => TransactionEntity, (transaction) => transaction.payment, {
    nullable: true,
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionEntity;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  order_id: string;

  @Column({ nullable: true })
  payment_method: string; // sepay 

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  sepay_transaction_id: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @Column({ type: 'json', nullable: true })
  raw_webhook: any;
}
