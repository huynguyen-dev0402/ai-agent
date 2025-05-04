import { Body, Controller, Post, Req } from '@nestjs/common';
import { ChatbotTokensService } from '@modules/chatbot-tokens/chatbot-tokens.service';
import { ApiBearerAuth, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@Controller('chatbot-tokens')
export class ChatbotTokensController {
  constructor(private readonly chatbotTokensService: ChatbotTokensService) {}

  @Post('generate-chatbot-token')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Generate a chatbot token for embedding' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        chatbot_id: { type: 'string', example: 'your-chatbot-id' },
      },
      required: ['chatbot_id'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token generated successfully',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateChatbotToken(
    @Req() request: Request & { user: { [key: string]: string } },
    @Body('chatbot_id') chatbotId: string,
  ) {
    const token = await this.chatbotTokensService.generateChatbotToken(
      request.user.id,
      chatbotId,
    );
    return { token };
  }
}
