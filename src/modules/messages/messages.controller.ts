import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { MessagesService } from '@modules/messages/messages.service';
import {
  GetMessageHistoryDto,
  GetCustomerMessageHistoryDto,
  GetMessagesByAgentDto,
  GetMessagesByConversationDto,
} from '@modules/messages/dto/get-message-history.dto';
import { Public } from '@common/decorators/public-route.decorator';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('by-conversation')
  async getMessagesByConversationId(
    @Query() query:GetMessagesByConversationDto
  ) {
    if (!query?.conversationId) {
      throw new BadRequestException('conversationId is required');
    }

    const history = await this.messagesService.getMessagesByConversationId(
      query.conversationId,
      {
        ...query,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );

    return { status: 'success', data: history };
  }

  @Get('customer-history')
  @Public()
  async getCustomerMessageHistory(
    @Query() query: GetCustomerMessageHistoryDto,
  ) {
    if (!query.userId) {
      throw new UnauthorizedException('userId is required');
    }

    const history = await this.messagesService.getCustomerMessageHistory(
      query.userId,
      {
        ...query,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );

    return { status: 'success', data: history };
  }

  @Get('by-agent')
  async getMessagesByAgent(@Query() query: GetMessagesByAgentDto) {
    if (!query.chatbotId) {
      throw new BadRequestException('chatbotId is required');
    }

    const history = await this.messagesService.getMessagesByAgent(
      query.chatbotId,
      {
        ...query,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
      },
    );

    return { status: 'success', data: history };
  }
}
