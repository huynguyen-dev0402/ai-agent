import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PublishChatbotDto {
  @IsNotEmpty({ message: 'Api token required' })
  api_token: string;

  @IsNotEmpty({ message: 'Must have connector id' })
  connector_id: string;
}
