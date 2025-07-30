import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

export enum ModelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ModelType {
  TEXT = 'text',
  MULTI = 'multi',
}

@Entity('models')
export class ChatbotModel {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique identifier for the chatbot model',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'GPT-4o',
    description: 'Name of the chatbot model',
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  model_name: string;

  @ApiProperty({
    example: 'Advanced AI model with improved reasoning capabilities',
    description: 'Description of the model',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'URL of the model icon',
    required: false,
  })
  @Column({ type: 'text', nullable: true })
  icon_url: string;

  @ApiProperty({
    example: 128000,
    description: 'Context length of the model in tokens',
    required: false,
  })
  @Column({ type: 'int', nullable: true })
  context_length: number;

  @ApiProperty({
    example: 'Advanced reasoning, Code generation, Math solving',
    description: 'Features supported by the model',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  features: string;

  @ApiProperty({
    example: 'OpenAI',
    description: 'Provider of the model',
    required: false,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  provider: string;

  @ApiProperty({
    example: ModelType.TEXT,
    description: 'Type of the model',
    enum: ModelType,
  })
  @Column({
    type: 'enum',
    enum: ModelType,
    default: ModelType.TEXT,
  })
  type: ModelType;

  @ApiProperty({
    example: ModelStatus.ACTIVE,
    description: 'Status of the model',
    enum: ModelStatus,
  })
  @Column({
    type: 'enum',
    enum: ModelStatus,
    default: ModelStatus.ACTIVE,
  })
  status: ModelStatus;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the model was created',
  })
  @CreateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ApiProperty({
    example: '2024-07-28T15:30:00.000Z',
    description: 'Date when the model was last updated',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Chatbot, (chatbot) => chatbot.model)
  chatbots: Chatbot[];
}
