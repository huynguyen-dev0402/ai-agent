import { User } from '@modules/users/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('chatbot_prompts')
export class ChatbotPrompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prompt_name', type: 'varchar', length: 255 })
  prompt_name: string;

  @Column({ name: 'prompt_info', type: 'text' })
  prompt_info: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, (user) => user.prompts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
