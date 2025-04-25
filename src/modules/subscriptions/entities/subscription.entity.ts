import { SubscriptionFeatures } from 'src/modules/subscription-features/entities/subscription-features.entity';
import { UserSubscriptions } from 'src/modules/user-subscriptions/entities/user-subscriptions.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  message_limit: number;

  @Column({ type: 'int' })
  knowledge_limit: number;

  @Column({ type: 'int' })
  member_limit: number;

  @Column({ type: 'int' })
  agent_limit: number;

  @Column({ type: 'boolean' })
  is_custom: boolean;

  @Column({ type: 'float' })
  price: number;

  @Column({ type: 'int' })
  duration_months: number;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(
    () => SubscriptionFeatures,
    (subscription_features) => subscription_features.subscription,
  )
  subscription_features: SubscriptionFeatures[];

  @OneToMany(
    () => UserSubscriptions,
    (user_subscriptions) => user_subscriptions.subscription,
  )
  user_subscriptions: UserSubscriptions[];
}
