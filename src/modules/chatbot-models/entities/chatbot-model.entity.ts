import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
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

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  max_tokens: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  presence_penalty: string;

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
}
