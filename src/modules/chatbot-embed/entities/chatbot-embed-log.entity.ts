import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { User } from '@modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('chatbot_embed_logs')
export class ChatbotEmbedLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  error_message?: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => User, (user) => user.embed_logs)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.embed_logs)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;
}
