import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  Body,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ChatbotEmbedService } from '@modules/chatbot-embed/chatbot-embed.service';
import { StartConversationDto } from '@modules/chatbot-embed/dto/start-conversation.dto';
import { CheckQuota } from '@common/decorators/check-quota.decorator';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { Public } from '@common/decorators/public-route.decorator';
import { ChatWithChatbotEmbedDto } from '@modules/chatbot-embed/dto/chat-chatbot-embed.dto';
import { Response } from 'express';
import { QUANTITY_REDUCE } from '@common/constants/quantity.constant';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Chatbot Embed')
@Controller('chatbot-embed')
export class ChatbotEmbedController {
  constructor(
    private readonly chatbotEmbedService: ChatbotEmbedService,
    private readonly chatbotService: ChatbotsService,
  ) {}

  @Get('init')
  @Public()
  @ApiOperation({ summary: 'Initialize chatbot embed session from iframe' })
  @ApiQuery({ name: 'chatbotId', required: true, type: String })
  @ApiQuery({ name: 'userId', required: true, type: String })
  @ApiQuery({ name: 'token', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Chatbot initialized successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          chatbotId: 'chatbot-id',
          userId: 'user-id',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Missing or invalid parameters' })
  async initChatbot(
    @Query('chatbotId') chatbotId: string,
    @Query('userId') userId: string,
    @Query('token') token: string,
  ) {
    if (!chatbotId || !userId || !token) {
      throw new ForbiddenException('Missing required parameters');
    }

    await this.chatbotEmbedService.validateChatbotEmbed(
      chatbotId,
      userId,
      token,
    );

    // Trả về dữ liệu cần thiết để render chatbot trong iframe
    return {
      status: 'success',
      data: {
        chatbotId,
        userId,
        // Thêm các thông tin khác nếu cần (ví dụ: chatbot_name, icon_url, prompt_info)
      },
    };
  }

  @Post('start-conversation')
  @Public()
  @ApiOperation({ summary: 'Start a conversation with the embedded chatbot' })
  @ApiBody({ type: StartConversationDto })
  @ApiResponse({
    status: 200,
    description: 'Conversation started successfully',
    schema: {
      example: {
        status: 'success',
        data: {
          conversationId: 'uuid',
          endUserId: 'end-user-id',
        },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Missing required fields' })
  async startConversation(@Body() startConversationDto: StartConversationDto) {
    const { external_id, platform, chatbot_id } = startConversationDto;
    if (!chatbot_id || !external_id || !platform) {
      throw new ForbiddenException('Missing required parameters');
    }

    const { conversationId, endUserId } =
      await this.chatbotEmbedService.initializeConversation(
        startConversationDto,
      );

    return {
      status: 'success',
      data: {
        conversationId,
        endUserId,
      },
    };
  }

  @Post('send')
  @Public()
  @UseInterceptors(CheckQuotaInterceptor)
  @CheckQuota({
    resourceType: ResourceType.MESSAGE,
    action: UsageAction.SEND,
    quantity: QUANTITY_REDUCE,
  })
  @ApiOperation({
    summary: 'Send message to embedded chatbot (with streaming)',
  })
  @ApiBody({ type: ChatWithChatbotEmbedDto })
  @ApiResponse({
    status: 200,
    description: 'Returns a streaming response from chatbot',
  })
  @ApiResponse({
    status: 403,
    description: 'Quota exceeded or invalid request',
  })
  async chatWithBot(
    @Body() chatEmbedChatbot: ChatWithChatbotEmbedDto,
    @Res({ passthrough: false }) response: Response,
  ) {
    return await this.chatbotService.chatWithBotEmbedStream(
      chatEmbedChatbot,
      response,
    );
  }
}
