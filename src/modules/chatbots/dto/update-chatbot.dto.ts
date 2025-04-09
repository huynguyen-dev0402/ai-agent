import { PartialType } from '@nestjs/swagger';
import { CreateChatbotDto } from './create-chatbot.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateChatbotDto extends PartialType(CreateChatbotDto) {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @ApiProperty({
    example: 'Desciption chatbot',
    description: 'Desciption chatbot',
  })
  @IsOptional()
  description?: string;

  @IsOptional()
  prompt_name?: string;

  @IsOptional()
  prompt_info?: string;
}
