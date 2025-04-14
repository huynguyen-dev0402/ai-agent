import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ChatWithChatbotDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have message' })
  message: string;
}
