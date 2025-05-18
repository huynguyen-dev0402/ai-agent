import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChatWithChatbotDto {
  @ApiProperty({
    description: 'The message to be sent to the chatbot.',
    type: String,
  })
  @IsNotEmpty({ message: 'Must have conversation_id' })
  conversation_id: string;

  @ApiProperty({
    description: 'The message to be sent to the chatbot.',
    type: String,
  })
  @IsNotEmpty({ message: 'Must have message' })
  message: string;
}
