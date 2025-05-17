import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { PaymentLogs } from './payment-log.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => UserSubscriptions,
    (user_subscriptions) => user_subscriptions.payments,
  )
  @JoinColumn({ name: 'user_subscription_id' })
  user_subscriptions: UserSubscriptions;

  @OneToMany(() => PaymentLogs, (payment_logs) => payment_logs.payment)
  payment_logs: PaymentLogs[];

  @Column({ type: 'float', nullable: false })
  amount: number;

  @Column({ type: 'varchar', length: 10, nullable: false, default: 'VND' })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['bank_card', 'momo', 'zalo_pay', 'paypal', 'sepay'],
    nullable: false,
  })
  payment_method: 'bank_card' | 'momo' | 'zalo_pay' | 'paypal' | 'sepay';

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  status: 'pending' | 'completed' | 'failed';

  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  transaction_id: string;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
