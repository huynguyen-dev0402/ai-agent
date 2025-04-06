import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ModelType {
  TEXT = 'text',
  MULTI = 'multi',
}

@Entity('models')
export class ChatbotModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  model_name: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  description: string;

  @Column({ type: 'int', nullable: true, collation: 'utf8mb4_unicode_ci' })
  context_length: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    collation: 'utf8mb4_unicode_ci',
  })
  features: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    collation: 'utf8mb4_unicode_ci',
  })
  provider: string;

  @Column({
    type: 'enum',
    enum: ModelType,
    default: ModelType.TEXT,
  })
  type: ModelType;

  @Column({
    type: 'enum',
    enum: ModelStatus,
    default: ModelStatus.ACTIVE,
  })
  status: ModelStatus;

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

  @OneToMany(() => Chatbot, (chatbot) => chatbot.model)
  chatbots: Chatbot[];
}
