import { ChatbotModel } from 'src/modules/chatbot-models/entities/chatbot-model.entity';
import { ChatbotOnboarding } from 'src/modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ChatbotResource } from './chatbot-resources.entity';

export enum ChatbotStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
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
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
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

  @OneToMany(
    () => ChatbotResource,
    (chatbot_resources) => chatbot_resources.chatbot,
  )
  chatbot_resources: ChatbotResource[];
}
