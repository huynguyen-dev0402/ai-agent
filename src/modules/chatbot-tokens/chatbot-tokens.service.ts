import { Injectable } from '@nestjs/common';
import { ChatbotToken } from './entities/chatbot-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ChatbotTokensService {
  constructor(
    @InjectRepository(ChatbotToken)
    private readonly chatbotTokenRepository: Repository<ChatbotToken>,
  ) {}

  async getTokenForUser(userId: string) {
    return this.chatbotTokenRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
      select: {
        user: {
          id: true,
        },
        chatbot: {
          id: true,
        },
      },
    });
  }
}
