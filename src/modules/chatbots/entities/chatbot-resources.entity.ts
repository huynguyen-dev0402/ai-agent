import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { Chatbot } from './chatbot.entity';
import { Resource } from 'src/modules/resources/entities/resource.entity';

@Entity('chatbot_resources')
@Unique(['chatbot', 'resource'])
export class ChatbotResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Chatbot, (chatbot) => chatbot.chatbot_resources)
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;

  @ManyToOne(() => Resource, (resource) => resource.chatbot_resources)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @CreateDateColumn()
  created_at: Date;
}
