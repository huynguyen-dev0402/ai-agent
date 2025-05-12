import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChatWithChatbotEmbedDto {
  @ApiProperty({
    description: 'Unique ID of the conversation.',
    type: String,
    example: '2f6c1ae4-b2e1-4fd4-8f9d-bd97c8cb95a2',
  })
  @IsNotEmpty({ message: 'Must have conversation_id' })
  conversation_id: string;

  @ApiProperty({
    description: 'Unique token of the chatbot that will receive the message.',
    type: String,
    example: 'jwt token',
  })
  @IsNotEmpty({ message: 'Must have token' })
  token: string;

  @ApiProperty({
    description: 'Domain',
    type: String,
    example: 'https://abc.com',
  })
  @IsNotEmpty({ message: 'Must have domain_client' })
  domain_client: string;

  @ApiProperty({
    description: 'Content of the message to be sent to the chatbot.',
    type: String,
    example: 'Hi, how can you help me today?',
  })
  @IsNotEmpty({ message: 'Must have message' })
  message: string;
}
