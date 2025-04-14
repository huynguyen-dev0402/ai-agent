import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatbotDto {
  @ApiProperty({
    example: 'Chatbot demo',
    description: 'Name chatbot',
  })
  @IsNotEmpty({ message: 'Name chatbot required' })
  chatbot_name: string;

  @ApiProperty({
    example: 'Desciption chatbot',
    description: 'Desciption chatbot',
  })
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'image.png', description: 'Image' })
  @IsOptional()
  thumbnail?: string;
}
