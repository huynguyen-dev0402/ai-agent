import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class PublishChatbotDto {
  @ApiProperty({
    description: 'The connector ID associated with the chatbot.',
    example: 'connector-12345',
  })
  @IsNotEmpty({ message: 'Must have connector id' })
  connector_id: string;
}
