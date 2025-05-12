import {
  Controller,
  Get,
  Query,
  ForbiddenException,
  Body,
  Post,
  Res,
  UseInterceptors,
  UseGuards,
  Req,
  BadRequestException,
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
import { Request, Response } from 'express';
import { QUANTITY_REDUCE } from '@common/constants/quantity.constant';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { InitChatbotQueryDto } from './dto/init-chatbot-query.dto';

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
  @ApiQuery({ name: 'domain', required: true, type: String })
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
    @Query() query: InitChatbotQueryDto,
  ) {
    const response = await this.chatbotEmbedService.validateChatbotEmbed(
      query,
    );

    // Trả về dữ liệu cần thiết để render chatbot trong iframe
    return {
      status: 'success',
      data: response,
      // Thêm các thông tin khác nếu cần (ví dụ: chatbot_name, icon_url, prompt_info)
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

  @Get('script')
  async getEmbedScript(
    @Query('chatbotId') chatbotId: string,
    @Query('domainId') domainId: string,
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    return this.chatbotEmbedService.generateEmbedScript(
      chatbotId,
      domainId,
      request.user.id,
    );
  }
}
