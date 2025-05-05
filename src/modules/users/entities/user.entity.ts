import { Exclude } from 'class-transformer';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { ChatbotPrompt } from '@modules/chatbot-prompt/entities/chatbot-prompt.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { Resource } from '@modules/resources/entities/resource.entity';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { ChatbotEmbedLog } from '@modules/chatbot-embed/entities/chatbot-embed-log.entity';
import { Ticket } from '@modules/tickets/entities/ticket.entity';
import { WorkspaceMember } from '@modules/workspace-members/entities/workspace-member.entity';

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin',
  USER = 'user',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, default: '7492336468052952080' })
  external_user_id: string;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  fullname?: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

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

  @ManyToOne(() => Workspace, (workspace) => workspace.users)
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => ApiToken, (api_token) => api_token.users)
  @JoinColumn({ name: 'token_id' })
  api_token: ApiToken;

  @OneToMany(() => Chatbot, (chatbot) => chatbot.user)
  chatbots: Chatbot[];

  @OneToMany(() => Resource, (resource) => resource.user)
  resources: Resource[];

  @OneToMany(() => ChatbotPrompt, (prompt) => prompt.user)
  prompts: ChatbotPrompt[];

  @OneToMany(
    () => UserSubscriptions,
    (user_subscriptions) => user_subscriptions.user,
  )
  user_subscriptions: UserSubscriptions[];

  @OneToMany(() => UsageLog, (usage_logs) => usage_logs.user)
  usage_logs: UsageLog[];

  @OneToMany(() => ChatbotToken, (chatbot_tokens) => chatbot_tokens.user)
  chatbot_tokens: ChatbotToken[];

  @OneToMany(() => ChatbotEmbedLog, (embed_logs) => embed_logs.user)
  embed_logs: ChatbotEmbedLog[];

  @OneToMany(() => Ticket, (tickets) => tickets.user)
  tickets: Ticket[];

  @OneToMany(
    () => WorkspaceMember,
    (workspace_members) => workspace_members.user,
  )
  workspace_members: WorkspaceMember[];
}
