import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '@modules/users/entities/user.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';

export enum ChatbotTokenStatus {
  ACTIVE = 'active',
  INACTIVE='inactive',
  REVOKED = 'revoked',
}
@Entity('chatbot_tokens')
export class ChatbotToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  token: string;

  @Column({
    type: 'enum',
    enum: ChatbotTokenStatus,
    default: ChatbotTokenStatus.ACTIVE,
  })
  status: ChatbotTokenStatus;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.chatbot_tokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.chatbot_tokens)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;
}
