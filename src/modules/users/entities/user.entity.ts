import { Exclude } from 'class-transformer';
import { ApiToken } from 'src/modules/api-tokens/entities/api-token.entity';
import { Workspace } from 'src/modules/workspaces/entities/workspace.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
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

  @OneToMany(() => ApiToken, (api_token) => api_token.user)
  api_tokens: ApiToken[];

  @OneToMany(() => Workspace, (workspace) => workspace.user)
  workspaces: Workspace[];
}
