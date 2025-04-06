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
  OneToOne,
} from 'typeorm';

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

  @Column({ name: 'model_id', default: '1716293913' })
  model_id: string;

  @Column({ type: 'varchar', default: '1024' })
  connector_id: string;

  @Column({ type: 'text', nullable: true })
  icon_url?: string;

  @Column({ type: 'varchar', nullable: true })
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

  @ManyToOne(() => Workspace, (workspace) => workspace.chatbots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => ChatbotModel)
  @JoinColumn({ name: 'model_id' })
  model: ChatbotModel;
}
