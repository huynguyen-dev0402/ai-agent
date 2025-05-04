import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateConversationDto {
  @ApiProperty({
    example: 'your-user-id-here',
  })
  @IsNotEmpty({ message: 'Id user required' })
  user_id: string;

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
