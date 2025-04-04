import { Exclude } from 'class-transformer';
import { ApiToken } from 'src/modules/api-tokens/entities/api-token.entity';
import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  MEMBER = 'member',
  PERSONAL = 'personal',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  username: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fullname: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: false })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  workspace_id: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PERSONAL })
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

  @ManyToOne(() => Customer, (customer) => customer.users, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer | null;

  @OneToMany(() => Chatbot, (chatbot) => chatbot.user)
  chatbots: Chatbot[];

  @OneToOne(() => ApiToken, (api_token) => api_token.user)
  api_token: ApiToken;
}
