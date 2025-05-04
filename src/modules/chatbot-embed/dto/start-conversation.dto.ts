import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { Platform } from '@modules/end-users/entities/end-user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class StartConversationDto extends CreateConversationDto {
  @IsNotEmpty({ message: 'External id of end user' })
  external_id: string;

  @ApiProperty({ example: 'website', description: 'Password' })
  @IsNotEmpty({ message: 'Platform is not empty' })
  platform: Platform;
}
