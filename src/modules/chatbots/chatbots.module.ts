import { Module } from '@nestjs/common';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { ChatbotsController } from '@modules/chatbots/chatbots.controller';
import { Chatbot } from './entities/chatbot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { WorkspacesModule } from '@modules/workspaces/workspaces.module';
import { ChatbotModelsModule } from '@modules/chatbot-models/chatbot-models.module';
import { ChatbotResource } from '@modules/chatbots/entities/chatbot-resources.entity';
import { Resource } from '@modules/resources/entities/resource.entity';
import { ChatbotOnboarding } from '@modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '@modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { User } from '@modules/users/entities/user.entity';
import { ChatbotModel } from '@modules/chatbot-models/entities/chatbot-model.entity';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
import { Reflector } from '@nestjs/core';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import { QuotaService } from '@modules/quota/quota.service';
import { MessagesModule } from '@modules/messages/messages.module';
import { Message } from '@modules/messages/entities/message.entity';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';
import { ChatbotTokensModule } from '@modules/chatbot-tokens/chatbot-tokens.module';
import { Domain } from '@modules/domains/entities/domain.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Chatbot,
      ChatbotResource,
      Resource,
      ChatbotOnboarding,
      OnboardingSuggestedQuestion,
      User,
      ChatbotModel,
      Message,
      Conversation,
      ChatbotToken,
      Domain,
      UserSubscriptions,
    ]),
    AuthModule,
    WorkspacesModule,
    UsersModule,
    ChatbotModelsModule,
    UserSubscriptionsModule,
    UsageLogsModule,
    MessagesModule,
    ChatbotTokensModule,
  ],
  controllers: [ChatbotsController],
  providers: [ChatbotsService, CheckQuotaInterceptor, Reflector, QuotaService],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
