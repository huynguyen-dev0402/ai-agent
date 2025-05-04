import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateConversationDto {
  @ApiProperty({
    description: 'API token used for authorization.',
    example: 'your-api-token-here',
  })
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @ApiProperty({
    example: 'your-chatbot-id-here',
  })
  @IsNotEmpty({ message: 'Id chatbot required' })
  chatbot_id: string;

  @ApiProperty({
    example: 'your-end-user-id-here',
  })
  @IsOptional()
  end_user_id?: string;
}
