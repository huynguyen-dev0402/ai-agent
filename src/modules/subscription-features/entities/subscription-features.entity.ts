import { Feature } from '@modules/features/entities/feature.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';

@Entity('subscription_features')
@Unique(['subscription', 'feature'])
export class SubscriptionFeatures {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(
    () => Subscription,
    (subscription) => subscription.subscription_features,
  )
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription;

  @ManyToOne(() => Feature, (feature) => feature.subscription_features)
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;
}
