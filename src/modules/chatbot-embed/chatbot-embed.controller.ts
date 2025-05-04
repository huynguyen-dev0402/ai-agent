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

@Controller('chatbot-embed')
export class ChatbotEmbedController {
  constructor(
    private readonly chatbotEmbedService: ChatbotEmbedService,
    private readonly chatbotService: ChatbotsService,
  ) {}

  @Get('init')
  @Public()
  async initChatbot(
    @Query('chatbotId') chatbotId: string,
    @Query('userId') userId: string,
    @Query('token') token: string,
  ) {
    if (!chatbotId || !userId || !token) {
      throw new ForbiddenException('Missing required parameters');
    }

    // Xác thực và kiểm tra domain
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
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MESSAGE,
    action: UsageAction.SEND,
    quantity: QUANTITY_REDUCE, // Số lượng sử dụng, mặc định là 1
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
