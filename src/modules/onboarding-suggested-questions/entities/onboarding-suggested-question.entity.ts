import { ChatbotOnboarding } from 'src/modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  Entity,
} from 'typeorm';
@Entity('suggested_questions')
export class OnboardingSuggestedQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  description: string;

  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  question: string;

  @Column({ type: 'int', nullable: true, collation: 'utf8mb4_unicode_ci' })
  position: number;

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

  @ManyToOne(
    () => ChatbotOnboarding,
    (chatbot_onboarding) => chatbot_onboarding.suggested_questions,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'chatbot_onboarding_id' })
  chatbot_onboarding: ChatbotOnboarding;
}
