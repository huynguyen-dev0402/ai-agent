import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Res,
  UseInterceptors,
  Get,
  BadRequestException,
} from '@nestjs/common';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
@UseGuards(AuthGuard)
@ApiTags('Chatbots')
@ApiBearerAuth('access-token')
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @UseGuards(UserIdMatchGuard) // Kiểm tra userId trong URL có khớp với userId trong token
  @Post('/:chatbotId/chat')
  @UseInterceptors(CheckQuotaInterceptor) // Áp dụng interceptor để ghi log usage
  @CheckQuota({
    resourceType: ResourceType.MESSAGE,
    action: UsageAction.SEND,
    quantity: 1, // Số lượng sử dụng, mặc định là 1
  })
  async chatWithBot(
    @Param('chatbotId') chatbotId: string,
    @Param('userId') userId: string,
    @Body() chatWithChatbotDto: ChatWithChatbotDto,
    @Res({ passthrough: false }) response: Response,
  ) {
    return await this.chatbotsService.chatWithBotStream(
      chatbotId,
      chatWithChatbotDto,
      response,
    );
  }

  @ApiTags('Chatbots')
  @ApiBearerAuth('access-token')
  @Get()
  /**
   * Lấy danh sách chatbot mà user là thành viên.
   * @param userId ID của user
   * @returns Danh sách chatbot
   */
  @ApiOperation({ summary: 'Lấy danh sách chatbot của user' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách chatbot trả về thành công.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  async getChatbots(@Param('userId') userId: string) {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }
    const result= await this.chatbotsService.findAllForMember(userId);
    return {
      success: true,
      message: 'Get successful chatbot list',
      data: result,
    };
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
