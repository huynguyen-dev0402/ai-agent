import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatbotDto {
  @ApiProperty({
    example: 'Chatbot demo',
    description: 'The name of the chatbot. This is a required field.',
    type: String,
  })
  @IsNotEmpty({ message: 'Name chatbot required' })
  chatbot_name: string;

  @ApiProperty({
    example: 'Description of the chatbot',
    description: 'Optional description for the chatbot.',
    type: String,
    required: false,
  })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'image.png',
    description: 'Optional thumbnail image for the chatbot.',
    type: String,
    required: false,
  })
  @IsOptional()
  thumbnail?: string;
}
