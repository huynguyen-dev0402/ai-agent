import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

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
  ): Promise<string> {
    const payload = { userId, chatbotId };
    const token = this.jwtService.sign(payload, { expiresIn: '30d' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    const tokenEntity = this.chatbotTokenRepository.create({
      user: { id: userId },
      chatbot: { id: chatbotId },
      token,
      expires_at: expiresAt,
      created_at: new Date(),
    });
    await this.chatbotTokenRepository.save(tokenEntity);

    return token;
  }

  async verifyChatbotToken(
    token: string,
  ): Promise<{ userId: string; chatbotId: string }> {
    try {
      const payload = this.jwtService.verify(token);
      const tokenEntity = await this.chatbotTokenRepository.findOne({
        where: { token },
      });
      if (!tokenEntity || tokenEntity.expires_at < new Date()) {
        throw new UnauthorizedException('Invalid or expired token');
      }
      return { userId: payload.userId, chatbotId: payload.chatbotId };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

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
