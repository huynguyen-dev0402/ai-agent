import { AuthService } from '@modules/auth/auth.service';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { EndUser } from '@modules/end-users/entities/end-user.entity';
import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatbotEmbedLog } from '@modules/chatbot-embed/entities/chatbot-embed-log.entity';
import { ConversationsService } from '@modules/conversations/conversations.service';
import { StartConversationDto } from '@modules/chatbot-embed/dto/start-conversation.dto';
import { ChatbotTokensService } from '@modules/chatbot-tokens/chatbot-tokens.service';
import { InitChatbotQueryDto } from './dto/init-chatbot-query.dto';

@Injectable()
export class ChatbotEmbedService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    @InjectRepository(ChatbotEmbedLog)
    private readonly chatbotEmbedLogRepository: Repository<ChatbotEmbedLog>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    private readonly chatbotTokenService: ChatbotTokensService,
    private readonly conversationService: ConversationsService,
  ) {}

  async validateChatbotEmbed(query: InitChatbotQueryDto): Promise<Chatbot> {
    const { userId, chatbotId, token } = query;
    // Bước 1: Xác thực token
    const payload = await this.chatbotTokenService.verifyChatbotToken(token);
    if (payload.userId !== userId || payload.chatbotId !== chatbotId) {
      await this.logEmbedAttempt(chatbotId, userId, false, 'Invalid token');
      throw new UnauthorizedException('Invalid token');
    }

    // Bước 2: Kiểm tra chatbot và quyền của user (khách hàng)
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      relations: ['user'],
      select: {
        id: true,
        chatbot_name: true,
        icon_url: true,
        user: {
          id: true,
        },
      },
    });
    if (!chatbot) {
      await this.logEmbedAttempt(chatbotId, userId, false, 'Chatbot not found');
      throw new ForbiddenException('Chatbot not found');
    }
    if (chatbot.user.id !== userId) {
      await this.logEmbedAttempt(
        chatbotId,
        userId,
        false,
        'User does not own this chatbot',
      );
      throw new ForbiddenException(
        'You do not have permission to use this chatbot',
      );
    }
    if (chatbot.status !== 'published') {
      await this.logEmbedAttempt(
        chatbotId,
        userId,
        false,
        'Chatbot is not published',
      );
      throw new ForbiddenException('Chatbot is not published');
    }

    // Bước 3: Ghi log thành công
    await this.logEmbedAttempt(chatbotId, userId, true);

    return chatbot;
  }

  async initializeConversation(
    startConversationDto: StartConversationDto,
  ): Promise<{ conversationId: string; endUserId: string }> {
    const { external_id, platform } = startConversationDto;
    // Tìm hoặc tạo endUser
    let endUser = await this.endUserRepository.findOne({
      where: { external_id: external_id, platform: platform },
    });
    if (!endUser) {
      endUser = this.endUserRepository.create({
        external_id: external_id,
        platform: platform,
      });
      await this.endUserRepository.save(endUser);
    }

    try {
      return this.conversationService.createConversation(startConversationDto);
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }

  async logEmbedAttempt(
    chatbotId: string,
    userId: string,
    success: boolean,
    errorMessage?: string,
  ) {
    const log = this.chatbotEmbedLogRepository.create({
      chatbot: { id: chatbotId },
      user: { id: userId },
      success,
      error_message: errorMessage,
    });
    await this.chatbotEmbedLogRepository.save(log);
  }
}
