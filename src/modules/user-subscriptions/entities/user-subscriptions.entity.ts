import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { User } from '@modules/users/entities/user.entity';
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

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
}

@Entity('user_subscriptions')
export class UserSubscriptions {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.user_subscriptions,
  )
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => User, (user) => user.user_subscriptions)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => UsageLog, (usage_logs) => usage_logs.user)
  usage_logs: UsageLog[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  start_date: Date;

  @Column({ type: 'timestamp' })
  end_date: Date; // Tính từ start_date + duration_months của gói

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
