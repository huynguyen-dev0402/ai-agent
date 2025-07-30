import { ChatbotModel } from '@modules/chatbot-models/entities/chatbot-model.entity';
import { ChatbotOnboarding } from '@modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { ChatbotResource } from '@modules/chatbots/entities/chatbot-resources.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { ChatbotEmbedLog } from '@modules/chatbot-embed/entities/chatbot-embed-log.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';

export enum ChatbotStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  INACTIVE = 'inactive',
  DELETED= 'deleted',
  ARCHIVED = 'archived',
}

@Entity('chatbots')
export class Chatbot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  chatbot_name: string;

  @Column({ type: 'varchar', default: '1024' })
  connector_id: string;

  @Column({ type: 'text', nullable: true })
  icon_url?: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  external_bot_id?: string;

  @Column({ type: 'text', nullable: true })
  prompt_info?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ChatbotStatus, default: ChatbotStatus.DRAFT })
  status: ChatbotStatus;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.chatbots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatbotModel, (model) => model.chatbots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'model_id' })
  model: ChatbotModel;

  @Column({ type: 'uuid', nullable: true })
  user_subscriptions_id?: string;

  @ManyToOne(
    () => UserSubscriptions,
    (user_subscriptions) => user_subscriptions.chatbots,
  )
  @JoinColumn({ name: 'user_subscriptions_id' })
  user_subscriptions: UserSubscriptions;

  @OneToOne(() => ChatbotOnboarding, (onboarding) => onboarding.chatbot)
  onboarding: ChatbotOnboarding;

  @OneToMany(
    () => ChatbotResource,
    (chatbot_resources) => chatbot_resources.chatbot,
  )
  chatbot_resources: ChatbotResource[];

  @OneToMany(() => Conversation, (conversations) => conversations.chatbot)
  conversations: Conversation[];

  @OneToMany(() => ChatbotToken, (chatbot_tokens) => chatbot_tokens.chatbot)
  chatbot_tokens: ChatbotToken[];

  @OneToMany(() => ChatbotEmbedLog, (embed_logs) => embed_logs.chatbot)
  embed_logs: ChatbotEmbedLog[];
}
