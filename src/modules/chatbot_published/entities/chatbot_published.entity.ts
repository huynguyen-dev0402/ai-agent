import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('chatbot_published')
export class ChatbotPublished {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', default: '1024', collation: 'utf8mb4_unicode_ci' })
  connector_ids: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  intent: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  user_input: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  output: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  published_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @OneToOne(() => Chatbot)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;
}
