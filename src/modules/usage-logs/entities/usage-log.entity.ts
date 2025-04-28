import { UserSubscriptions } from 'src/modules/user-subscriptions/entities/user-subscriptions.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ResourceType {
  MESSAGE = 'message',
  AGENT = 'agent',
  MEMBER = 'member',
  KNOWLEDGE = 'knowledge',
}

export enum UsageAction {
  SEND = 'SEND',
  DELETE = 'DELETE',
  READ = 'READ',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  ACCESS = 'ACCESS',
}

export enum UsageSource {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  API = 'API',
  SYSTEM = 'SYSTEM',
}

export enum UsageStatus {
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  PENDING = "PENDING",
}

@Entity('usage_logs')
@Index('idx_usage_logs_user_id', ['user'])
@Index('idx_usage_logs_subscription_id', ['user_subscriptions'])
@Index('idx_usage_logs_resource_type', ['resource_type'])
@Index('idx_usage_logs_used_at', ['used_at'])
@Index('idx_usage_logs_user_resource_used', [
  'user',
  'resource_type',
  'used_at',
])
@Index('idx_usage_logs_subscription_resource_used', [
  'user_subscriptions',
  'resource_type',
  'used_at',
])
export class UsageLog {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'session_id', type: 'uuid', nullable: true })
  session_id?: string;

  @Column({
    name: 'resource_type',
    type: 'enum',
    enum: ResourceType,
  })
  resource_type: ResourceType;

  @Column({
    name: 'action',
    type: 'enum',
    enum: UsageAction,
  })
  action: UsageAction;

  @Column({
    name: 'quantity',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  quantity?: number;

  @Column({
    name: 'details',
    type: 'json',
    nullable: true,
  })
  details?: Record<string, any>;

  @Column({
    name: 'source',
    type: 'enum',
    enum: UsageSource,
  })
  source: UsageSource;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UsageStatus,
    default: UsageStatus.PENDING,
  })
  status: UsageStatus;

  @CreateDateColumn({
    name: 'used_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  used_at: Date;

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => UserSubscriptions, { nullable: true })
  @JoinColumn({ name: 'user_subscription_id' })
  user_subscriptions?: UserSubscriptions;
}
