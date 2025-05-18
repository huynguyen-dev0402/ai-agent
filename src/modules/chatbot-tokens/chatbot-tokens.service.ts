import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  ChatbotToken,
  ChatbotTokenStatus,
} from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

interface ChatbotTokenPayload {
  userId: string;
  chatbotId: string;
  domainId: string;
}

@Injectable()
export class ChatbotTokensService {
  constructor(
    @InjectRepository(ChatbotToken)
    private readonly chatbotTokenRepository: Repository<ChatbotToken>,
    private readonly jwtService: JwtService,
  ) {}

  async generateChatbotToken(
    userId: string,
    chatbotId: string,
    domainId: string,
  ): Promise<string> {
    const payload = { userId, chatbotId, domainId };
    const token = this.jwtService.sign(payload);

    const tokenEntity = this.chatbotTokenRepository.create({
      user: { id: userId },
      chatbot: { id: chatbotId },
      status: ChatbotTokenStatus.ACTIVE,
      token,
      created_at: new Date(),
    });
    await this.chatbotTokenRepository.save(tokenEntity);

    return token;
  }

  async verifyChatbotToken(token: string): Promise<ChatbotTokenPayload> {
    try {
      // Kiểm tra token có bị revoke chưa
      const tokenEntity = await this.chatbotTokenRepository.findOne({
        where: { token, status: ChatbotTokenStatus.ACTIVE },
      });

      if (!tokenEntity) {
        throw new UnauthorizedException('Token has been revoked');
      }

      // Verify token dùng cấu hình mặc định
      return await this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async revokeToken(token: string): Promise<void> {
    const tokenEntity = await this.chatbotTokenRepository.findOne({
      where: { token, status: ChatbotTokenStatus.ACTIVE },
    });

    if (tokenEntity) {
      tokenEntity.status = ChatbotTokenStatus.REVOKED;
      await this.chatbotTokenRepository.save(tokenEntity);
    }
  }

  async getTokenForUser(userId: string) {
    return this.chatbotTokenRepository.findOne({
      where: {
        user: {
          id: userId,
        },
        status: ChatbotTokenStatus.ACTIVE,
      },
      relations: {
        chatbot: true,
        user: true,
      },
      select: {
        user: {
          id: true,
        },
        chatbot: {
          id: true,
        },
        token: true,
        created_at: true,
      },
    });
  }
}
