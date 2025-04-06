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
    collation: 'utf8mb4_unicode_ci',
  })
  chatbot_name: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  icon_url: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  prompt_info: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  description: string;

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
}
