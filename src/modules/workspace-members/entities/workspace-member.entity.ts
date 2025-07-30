import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { ApiProperty } from '@nestjs/swagger';
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
@Index('idx_workspace_members_user_id', ['user'])
export class WorkspaceMember {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the workspace member',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: WorkspaceMemberRole.MEMBER,
    description: 'Role of the member in the workspace',
    enum: WorkspaceMemberRole,
  })
  @Column({
    type: 'enum',
    enum: WorkspaceMemberRole,
    default: WorkspaceMemberRole.MEMBER,
  })
  role: WorkspaceMemberRole;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the member joined the workspace',
  })
  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joined_at: Date;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the user',
  })
  @Column({ type: 'uuid' })
  user_id: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the user who invited this member',
  })
  @Column({ type: 'uuid' })
  invited_by: string;

  // @Column({ type: 'text' })
  // workspace_id: string;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the member record was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the member record was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  // @ManyToOne(() => Workspace, (workspace) => workspace.workspace_members, {
  //   nullable: false,
  // })
  // @JoinColumn({ name: 'workspace_id' })
  // workspace: Workspace;

  @ManyToOne(() => User, (user) => user.workspace_members, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  inviter: User;
}
