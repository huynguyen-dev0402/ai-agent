import { Exclude } from 'class-transformer';
import { ApiToken } from 'src/modules/api-tokens/entities/api-token.entity';
import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
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

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserType {
  PERSONAL = 'personal',
  BUSINESS = 'business',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, default: '7486079853985907729' })
  external_user_id: string;

  @Column({ type: 'varchar', nullable: false })
  username: string;

  @Column({ type: 'varchar', nullable: true })
  fullname?: string;

  @Column({ type: 'varchar', nullable: true })
  business_name?: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  domain?: string;

  @Column({ type: 'text', unique: true, nullable: true })
  address?: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  avatar_url?: string;

  @Column({ type: 'enum', enum: UserType, nullable: false })
  type: UserType;

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

  @ManyToOne(() => Workspace, (workspace) => workspace.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => ApiToken, (api_token) => api_token.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'token_id' })
  api_token: ApiToken;

  @OneToMany(() => Chatbot, (chatbot) => chatbot.user)
  chatbots: Chatbot[];
}
