import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { ChatWithChatbotDto } from '@modules/chatbots/dto/chat-with-chatbot.dto';
import { Response } from 'express';
import { CheckQuota } from '@common/decorators/check-quota.decorator';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';

@Controller('users/:userId/chatbots')
@UseGuards(AuthGuard, UserIdMatchGuard)
@ApiTags('Chatbots')
@ApiBearerAuth('access-token')
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @Post('/:chatbotId/chat')
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MESSAGE,
    action: UsageAction.SEND,
    quantity: 1, // Số lượng sử dụng, mặc định là 1
  })
  async chatWithBot(
    @Param('chatbotId') chatbotId: string,
    @Req() request: Request & { user: { [key: string]: string } },
    @Body() chatWithChatbotDto: ChatWithChatbotDto,
    @Res({ passthrough: false }) response: Response,
  ) {
    return await this.chatbotsService.chatWithBotStream(
      request.user.external_user_id,
      chatbotId,
      chatWithChatbotDto,
      response,
    );
  }

  // @Post('/:chatbotId/iframe/chat')
  // async chatWithBotIframe(
  //   @Param('chatbotId') chatbotId: string,
  //   @Param('userId') userId: string,
  //   @Body() body: any,
  //   @Res({ passthrough: false }) response: Response,
  // ) {
  //   return await this.chatbotsService.chatWithBotStreamIframe(
  //     userId,
  //     chatbotId,
  //     body.message,
  //     response,
  //   );
  // }
}
