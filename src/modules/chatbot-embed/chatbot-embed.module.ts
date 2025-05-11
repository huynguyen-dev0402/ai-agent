import { Module } from '@nestjs/common';
import { ChatbotEmbedService } from '@modules/chatbot-embed/chatbot-embed.service';
import { ChatbotEmbedController } from '@modules/chatbot-embed/chatbot-embed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatbotEmbedLog } from '@modules/chatbot-embed/entities/chatbot-embed-log.entity';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { EndUser } from '@modules/end-users/entities/end-user.entity';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { ChatbotsModule } from '@modules/chatbots/chatbots.module';
import { AuthModule } from '@modules/auth/auth.module';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import { QuotaService } from '@modules/quota/quota.service';
import { Reflector } from '@nestjs/core';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatbotTokensModule } from '@modules/chatbot-tokens/chatbot-tokens.module';
import { Domain } from '@modules/domains/entities/domain.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatbotEmbedLog,
      ChatbotToken,
      Chatbot,
      Conversation,
      EndUser,
      Domain,
    ]),
    ConversationsModule,
    ChatbotsModule,
    AuthModule,
    UserSubscriptionsModule,
    UsageLogsModule,
    ChatbotTokensModule,
  ],
  controllers: [ChatbotEmbedController],
  providers: [
    ChatbotEmbedService,
    CheckQuotaInterceptor,
    Reflector,
    QuotaService,
  ],
})
export class ChatbotEmbedModule {}
