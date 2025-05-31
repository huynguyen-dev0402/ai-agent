import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { CreateConversationDto } from '@modules/conversations/dto/create-conversation.dto';
import { Public } from '@common/decorators/public-route.decorator';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Lấy danh sách conversation theo chatbotId' })
  @ApiQuery({
    name: 'chatbotId',
    required: true,
    description: 'ID của chatbot',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách conversation trả về thành công.',
  })
  @ApiResponse({ status: 400, description: 'Thiếu hoặc sai chatbotId.' })
  findAll(@Query('chatbotId') chatbotId: string) {
    return this.conversationsService.findAllByChatbotId(chatbotId);
  }

  @Get('/:id')
  findOne(@Param('id') id: string) {
    return this.conversationsService.findOne(id);
  }
}
