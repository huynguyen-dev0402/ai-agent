import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { Public } from '@common/decorators/public-route.decorator';
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  @Public()
  createConversation(
    @Body(new ValidationPipe()) createDto: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(createDto);
  }

  @Get('')
  findAll(@Query('chatbotId') chatbotId: string) {
    return this.conversationsService.findAllByChatbotId(chatbotId);
  }

  @Get(':/id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }
}
