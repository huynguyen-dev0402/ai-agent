import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { SenderType } from '../entities/message.entity';
export class CreateMessageDto {
  @ApiProperty({
    example: 'your-conversation-id-here',
  })
  @IsNotEmpty({ message: 'Id conversation required' })
  conversation_id: string;

  @ApiProperty({
    example: 'your-sender-type-here',
  })
  @IsNotEmpty({ message: 'Sender type required' })
  sender_type: SenderType;

  @ApiProperty({
    example: 'your-message-content-here',
  })
  @IsNotEmpty({ message: 'Message content required' })
  message_content: string;

  @ApiProperty({
    example: 'YYYY-MM-DD',
  })
  @IsNotEmpty({ message: 'Send at required' })
  send_at: Date;
}
