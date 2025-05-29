import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { Payment } from '@modules/payments/entities/payment.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';

export enum SubscriptionStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

@Entity('user_subscriptions')
@Unique(['order_id'])
@Unique(['sepay_transaction_id'])
export class UserSubscriptions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.user_subscriptions,
  )
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.user_subscriptions)
  chatbots?: Chatbot[];

  @ManyToOne(() => User, (user) => user.user_subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => UsageLog, (usage_logs) => usage_logs.user)
  usage_logs: UsageLog[];

  @OneToMany(() => Payment, (payment) => payment.user_subscriptions)
  payments: Payment[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date; // Tính từ start_date + duration_months của gói

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.PENDING,
  })
  status: SubscriptionStatus;

  @Column({ nullable: true })
  order_id: string; // Unique order ID for SePay

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  amount: number; // Expected payment amount

  @Column({ nullable: true })
  sepay_transaction_id: number; // SePay transaction ID

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
