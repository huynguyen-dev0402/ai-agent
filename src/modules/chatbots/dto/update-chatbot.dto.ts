import { PartialType } from '@nestjs/swagger';
import { CreateChatbotDto } from './create-chatbot.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { KnowledgeDto } from './knowledge.dto';
import { ModelConfigDto } from './model-config.dto';

export class UpdateChatbotDto extends PartialType(CreateChatbotDto) {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsOptional()
  chatbot_name: string;

  @ApiProperty({
    example: 'Desciption chatbot',
    description: 'Desciption chatbot',
  })
  @IsOptional()
  description?: string;

  @IsOptional()
  @Type(() => ModelConfigDto)
  model_info_config?: ModelConfigDto;
}
