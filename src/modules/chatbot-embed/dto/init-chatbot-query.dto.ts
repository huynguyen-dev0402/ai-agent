import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InitChatbotQueryDto {
  @ApiProperty({ description: 'Chatbot ID' })
  @IsNotEmpty()
  @IsString()
  chatbotId: string;

  @ApiProperty({ description: 'User ID' })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Token for authentication' })
  @IsNotEmpty()
  @IsString()
  token: string;
}
