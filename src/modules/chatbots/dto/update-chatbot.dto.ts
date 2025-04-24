import { PartialType } from '@nestjs/swagger';
import { CreateChatbotDto } from './create-chatbot.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { KnowledgeDto } from './knowledge.dto';
import { ModelConfigDto } from './model-config.dto';

export class UpdateChatbotDto extends PartialType(CreateChatbotDto) {
  @ApiProperty({
    description: 'API token used for authorization.',
    example: 'your-api-token-here',
  })
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @ApiProperty({
    description: 'The updated name for the chatbot. Leave empty to not change.',
    example: 'Updated Chatbot Name',
    required: false,
  })
  @IsOptional()
  chatbot_name: string;

  @ApiProperty({
    example: 'Description of the updated chatbot',
    description: 'Optional description of the chatbot.',
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Model configuration information for the chatbot.',
    required: false,
    type: ModelConfigDto,
  })
  @IsOptional()
  @Type(() => ModelConfigDto)
  model_info_config?: ModelConfigDto;
}
