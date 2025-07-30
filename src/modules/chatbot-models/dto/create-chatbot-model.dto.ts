import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsEnum,
  Min,
} from 'class-validator';
import { ModelStatus, ModelType } from '../entities/chatbot-model.entity';

export class CreateChatbotModelDto {
  @ApiProperty({
    example: 'GPT-4o',
    description: 'Name of the chatbot model',
  })
  @IsString({ message: 'Model name must be a string' })
  @IsNotEmpty({ message: 'Model name cannot be empty' })
  model_name: string;

  @ApiProperty({
    example: 'Advanced AI model with improved reasoning capabilities',
    description: 'Description of the model',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'https://example.com/icon.png',
    description: 'URL of the model icon',
    required: false,
  })
  @IsString({ message: 'Icon URL must be a string' })
  @IsOptional()
  icon_url?: string;

  @ApiProperty({
    example: 128000,
    description: 'Context length of the model in tokens',
    required: false,
  })
  @IsInt({ message: 'Context length must be an integer' })
  @Min(1, { message: 'Context length must be greater than 0' })
  @IsOptional()
  context_length?: number;

  @ApiProperty({
    example: 'Advanced reasoning, Code generation, Math solving',
    description: 'Features supported by the model',
    required: false,
  })
  @IsString({ message: 'Features must be a string' })
  @IsOptional()
  features?: string;

  @ApiProperty({
    example: 'OpenAI',
    description: 'Provider of the model',
    required: false,
  })
  @IsString({ message: 'Provider must be a string' })
  @IsOptional()
  provider?: string;

  @ApiProperty({
    example: ModelType.TEXT,
    description: 'Type of the model',
    enum: ModelType,
    default: ModelType.TEXT,
  })
  @IsEnum(ModelType, { message: 'Type must be either text or multi' })
  @IsOptional()
  type?: ModelType = ModelType.TEXT;

  @ApiProperty({
    example: ModelStatus.ACTIVE,
    description: 'Status of the model',
    enum: ModelStatus,
    default: ModelStatus.ACTIVE,
  })
  @IsEnum(ModelStatus, { message: 'Status must be either active or inactive' })
  @IsOptional()
  status?: ModelStatus = ModelStatus.ACTIVE;
}
