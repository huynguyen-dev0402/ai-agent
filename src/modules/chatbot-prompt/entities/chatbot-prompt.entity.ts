import { Resource } from 'src/modules/resources/entities/resource.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('chatbot_prompts')
export class ChatbotPrompt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'prompt_name', type: 'varchar', length: 255 })
  prompt_name: string;

  @Column({ name: 'prompt_info', type: 'text' })
  prompt_info: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  @ManyToOne(() => Resource, (resource) => resource.prompts)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;
}
