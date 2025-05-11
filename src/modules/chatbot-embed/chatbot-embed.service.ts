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
import { Domain, DomainStatus } from '@modules/domains/entities/domain.entity';
import { ChatbotStatus } from '@modules/chatbots/entities/chatbot.entity';
import {
  ChatbotToken,
  ChatbotTokenStatus,
} from '@modules/chatbot-tokens/entities/chatbot-token.entity';

@Injectable()
export class ChatbotEmbedService {
  constructor(
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    @InjectRepository(ChatbotEmbedLog)
    private readonly chatbotEmbedLogRepository: Repository<ChatbotEmbedLog>,
    @InjectRepository(Domain)
    private readonly domainRepository: Repository<Domain>,
    @InjectRepository(ChatbotToken)
    private readonly chatbotTokenRepository: Repository<ChatbotToken>,
    @InjectRepository(EndUser)
    private readonly endUserRepository: Repository<EndUser>,
    private readonly chatbotTokenService: ChatbotTokensService,
    private readonly conversationService: ConversationsService,
  ) {}

  async validateChatbotEmbed(
    query: InitChatbotQueryDto,
    host: string,
  ): Promise<Chatbot> {
    const { userId, chatbotId, token } = query;

    // Bước 1: Xác thực token
    const payload = await this.chatbotTokenService.verifyChatbotToken(token);
    if (
      !payload ||
      !payload.userId ||
      !payload.chatbotId ||
      !payload.domainId
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    // Bước 2: Kiểm tra trạng thái token
    const tokenRecord = await this.chatbotTokenRepository.findOne({
      where: {
        token,
        status: ChatbotTokenStatus.ACTIVE,
      },
    });
    if (!tokenRecord) {
      throw new UnauthorizedException('Token is revoked or inactive');
    }

    // Bước 3: Kiểm tra chatbot và quyền của user
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      relations: ['user'],
      select: {
        id: true,
        status: true,
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

    // Bước 4: Kiểm tra quyền sở hữu chatbot
    if (chatbot.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this chatbot',
      );
    }

    // Bước 5: Kiểm tra trạng thái chatbot
    if (chatbot.status !== ChatbotStatus.PUBLISHED) {
      throw new ForbiddenException('Chatbot is not published');
    }

    // Bước 6: Lấy domain từ domainId trong token payload
    const domain = await this.domainRepository.findOne({
      where: { id: payload.domainId },
      relations: ['user'],
      select: {
        id: true,
        name: true,
        status: true,
        isVerified: true,
        user: {
          id: true,
        },
      },
    });

    if (!domain) {
      throw new ForbiddenException('Domain not found');
    }

    if (domain.name !== host) {
      throw new ForbiddenException('Domain not match');
    }

    // Bước 7: Kiểm tra trạng thái domain
    if (domain.status !== DomainStatus.ACTIVE) {
      throw new ForbiddenException('Domain is not active');
    }

    // Bước 8: Kiểm tra domain đã được verify
    if (!domain.isVerified) {
      throw new ForbiddenException('Domain is not verified');
    }

    // Bước 9: Kiểm tra domain có thuộc về user không
    if (domain.user.id !== userId) {
      throw new ForbiddenException('Domain does not belong to this user');
    }

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

  async generateEmbedScript(
    chatbotId: string,
    domainId: string,
    userId: string,
  ) {
    // Bước 1: Kiểm tra chatbot tồn tại và thuộc về user
    const chatbot = await this.chatbotRepository.findOne({
      where: { id: chatbotId },
      relations: ['user'],
    });
    if (!chatbot) {
      throw new ForbiddenException('Chatbot not found');
    }

    if (chatbot.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to use this chatbot',
      );
    }

    // Bước 2: Kiểm tra trạng thái chatbot
    if (chatbot.status !== ChatbotStatus.PUBLISHED) {
      throw new ForbiddenException('Chatbot is not published');
    }

    // Bước 3: Kiểm tra domain tồn tại và hợp lệ
    const domain = await this.domainRepository.findOne({
      where: { id: domainId },
      relations: ['user'],
    });
    if (!domain) {
      throw new ForbiddenException('Domain not found');
    }

    // Bước 4: Kiểm tra trạng thái domain
    if (domain.status !== DomainStatus.ACTIVE) {
      throw new ForbiddenException('Domain is not active');
    }

    // Bước 5: Kiểm tra domain có thuộc về user không
    if (domain.user.id !== userId) {
      throw new ForbiddenException('Domain does not belong to this user');
    }

    // Bước 6: Kiểm tra domain đã được verify chưa
    if (!domain.isVerified) {
      throw new ForbiddenException('Domain is not verified');
    }

    // Bước 7: Tạo token với thông tin domainId
    const token = await this.chatbotTokenService.generateChatbotToken(
      userId,
      chatbotId,
      domainId,
    );

    // Bước 9: Tạo script với domainId
    const script = `
      <script>
        window.ChatbotConfig = {
          siteURL: "https://ai-agent-v2.vercel.app",
          token: "${token}",
          userId:"${userId}",
          chatbotId:${chatbotId}
        };
      </script>
      <script src="https://ai-agent-v2.vercel.app/embed/embed-chatbot.js" async></script>
    `;

    return {
      script: script.trim(),
    };
  }
}
