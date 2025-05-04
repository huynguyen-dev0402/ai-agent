import { Controller } from '@nestjs/common';
import { ChatbotTokensService } from './chatbot-tokens.service';

@Controller('chatbot-tokens')
export class ChatbotTokensController {
  constructor(private readonly chatbotTokensService: ChatbotTokensService) {}
}
