import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EmbedStatus {
  ACTIVE = 'active',
  EXPIRES = 'expires',
  REVOKED = 'revoked',
}

@Entity('chatbot_tokens')
@Index('idx_chatbot_tokens_token', ['token'], { unique: true })
@Index('idx_chatbot_tokens_status', ['status'])
export class ChatbotToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  token: string;

  @Column({
    type: 'enum',
    enum: EmbedStatus,
    default: EmbedStatus.ACTIVE,
  })
  status: EmbedStatus;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ type: 'timestamp' })
  expires_at: Date;

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

  @ManyToOne(() => User, (user) => user.chatbot_tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.chatbot_tokens)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;
}
