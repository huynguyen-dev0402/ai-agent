import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import { OnboardingSuggestedQuestion } from 'src/modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  Entity,
} from 'typeorm';
@Entity('chatbot_onboarding')
export class ChatbotOnboarding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  description: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  prologue: string;

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

  @OneToMany(
    () => OnboardingSuggestedQuestion,
    (suggested_question) => suggested_question.chatbot_onboarding,
  )
  suggested_question: [OnboardingSuggestedQuestion];
}
