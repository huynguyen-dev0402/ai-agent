import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
  JoinColumn,
} from 'typeorm';

export enum WorkspaceMemberRole {
  ADMIN = 'admin',
  MEMBER = 'member',
}

@Entity('workspace_members')
@Index('idx_workspace_members_workspace_id', ['workspace'])
@Index('idx_workspace_members_user_id', ['user'])
export class WorkspaceMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: WorkspaceMemberRole,
    default: WorkspaceMemberRole.MEMBER,
  })
  role: WorkspaceMemberRole;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joined_at: Date;

  @Column({ type: 'uuid' })
  user_manager_id: string;

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

  @ManyToOne(() => Workspace, (workspace) => workspace.workspace_members, {
    nullable: false,
  })
  @JoinColumn({ name: 'workspace_id' })
  workspace: Workspace;

  @ManyToOne(() => User, (user) => user.workspace_members, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
