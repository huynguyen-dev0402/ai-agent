import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
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

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ nullable: true })
  order_id: string; // Matches UserSubscriptions.order_id

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
