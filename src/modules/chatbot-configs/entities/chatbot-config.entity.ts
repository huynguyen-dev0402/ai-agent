import { ChatbotModel } from 'src/modules/chatbot-models/entities/chatbot-model.entity';
import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Entity,
} from 'typeorm';
@Entity('chatbot_config')
export class ChatbotConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  context_round: string;

  @Column({ type: 'float', nullable: true, collation: 'utf8mb4_unicode_ci' })
  frequency_penalty: number;

  @Column({ type: 'int', nullable: true, collation: 'utf8mb4_unicode_ci' })
  max_tokens: number;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  response_format: string;

  @Column({ type: 'int', nullable: true, collation: 'utf8mb4_unicode_ci' })
  top_k: number;

  @Column({ type: 'int', nullable: true, collation: 'utf8mb4_unicode_ci' })
  top_p: number;

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

  @OneToOne(() => Chatbot)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;

  @OneToOne(() => ChatbotModel)
  @JoinColumn({ name: 'model_id' })
  model: ChatbotModel;
}
