import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  createConversation(
    @Body(new ValidationPipe()) createDto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(createDto);
  }
}
