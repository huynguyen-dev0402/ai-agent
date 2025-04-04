import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChatbotDto {
  @ApiProperty({
    example: 'Chatbot demo',
    description: 'Name chatbot',
  })
  @IsNotEmpty({ message: 'Name chatbot required' })
  chatbot_name: string;

  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsNotEmpty({ message: 'Workspace id required' })
  workspace_id: string;

  @IsNotEmpty({ message: 'Model id required' })
  model_id: string;

  @IsNotEmpty({ message: 'User id required' })
  user_id: string;

  @ApiProperty({
    example: 'Desciption chatbot',
    description: 'Desciption chatbot',
  })
  @IsOptional()
  description?: string;

  @IsOptional()
  prompt_info?: string;

  @ApiProperty({ example: 'image.png', description: 'Image' })
  @IsOptional()
  thumbnail?: string;
}
