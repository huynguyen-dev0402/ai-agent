import { BadRequestException, Controller, Get, Query, UnauthorizedException } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}
  @Get('history')
  async getMessageHistory(
    @Query('endUserId') endUserId: string,
    @Query('status') status?: 'active' | 'ended',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    if (!endUserId) {
      throw new BadRequestException('endUserId is required');
    }

    const history = await this.messagesService.getMessageHistory(endUserId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return {
      status: 'success',
      data: history,
    };
  }
  //API lấy danh sách tin nhắn theo user (khách hàng sở hữu chatbot)
  @Get('customer-history')
  async getCustomerMessageHistory(
    @Query('userId') userId: string,
    @Query('chatbotId') chatbotId?: string,
    @Query('status') status?: 'active' | 'ended',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    if (!userId) {
      throw new UnauthorizedException('userId is required');
    }

    const history = await this.messagesService.getCustomerMessageHistory(
      userId,
      {
        chatbotId,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      },
    );

    return {
      status: 'success',
      data: history,
    };
  }

  @Get('by-agent')
  async getMessagesByAgent(
    @Query('chatbotId') chatbotId: string,
    @Query('status') status?: 'active' | 'ended',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    if (!chatbotId) {
      throw new BadRequestException('chatbotId is required');
    }

    const history = await this.messagesService.getMessagesByAgent(chatbotId, {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit,
      offset,
    });

    return {
      status: 'success',
      data: history,
    };
  }
}
