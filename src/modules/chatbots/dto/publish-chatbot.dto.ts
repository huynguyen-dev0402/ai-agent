import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PublishChatbotDto {
  @ApiProperty({
    description: 'The API token used for authorization.',
    example: 'your-api-token-here',
  })
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @ApiProperty({
    description: 'The connector ID associated with the chatbot.',
    example: 'connector-12345',
  })
  @IsNotEmpty({ message: 'Must have connector id' })
  connector_id: string;
}
