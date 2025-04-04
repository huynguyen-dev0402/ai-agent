import { ChatbotOnboarding } from 'src/modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

export enum ChatbotStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('chatbots')
export class Chatbot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  chatbot_name: string;

  @Column({ type: 'text', nullable: true })
  thumbnail: string;

  @Column({ type: 'text', nullable: true })
  prompt_info: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ChatbotStatus, default: ChatbotStatus.ACTIVE })
  status: Chatbot;

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

  @ManyToOne(() => User, (user) => user.chatbots, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToOne(() => ChatbotOnboarding)
  chatbot_onboarding: ChatbotOnboarding;
}
