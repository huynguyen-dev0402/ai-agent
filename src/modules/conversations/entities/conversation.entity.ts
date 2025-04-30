import { Chatbot } from 'src/modules/chatbots/entities/chatbot.entity';
import { EndUser } from 'src/modules/end-users/entities/end-user.entity';
import { Message } from 'src/modules/messages/entities/message.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

export enum ConversationStatus {
  ACTIVE = 'active',
  ENDED = 'ended',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  external_conversation_id: string;

  // @Column({ type: 'varchar', length: 255, unique: true })
  // session_id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  started_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date | null;

  @Column({
    type: 'enum',
    enum: ConversationStatus,
    default: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

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

  // Relations
  @ManyToOne(() => Chatbot, (chatbot) => chatbot.conversations)
  //@Index('idx_conversations_chatbot_id')
  @JoinColumn({ name: 'chatbot_id' })
  chatbot: Chatbot;

  @OneToMany(() => Message, (messages) => messages.conversation)
  messages: Message[];

  @ManyToOne(() => EndUser, (end_user) => end_user.conversations)
  @JoinColumn({ name: 'end_user_id' })
  end_user: EndUser;
}
