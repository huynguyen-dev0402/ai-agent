import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { ChatbotsController } from './chatbots.controller';
import { Chatbot } from './entities/chatbot.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { ChatbotModelsModule } from '../chatbot-models/chatbot-models.module';
import { ChatbotResource } from './entities/chatbot-resources.entity';
import { Resource } from '../resources/entities/resource.entity';
import { ChatbotOnboarding } from '../chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '../onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { User } from '../users/entities/user.entity';
import { ChatbotModel } from '../chatbot-models/entities/chatbot-model.entity';
import { UserSubscriptionsModule } from '../user-subscriptions/user-subscriptions.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { Reflector } from '@nestjs/core';
import { CheckQuotaInterceptor } from 'src/common/interceptors/usage-logs.interceptor';
import { QuotaService } from '../quota/quota.service';
import { MessagesModule } from '../messages/messages.module';
import { ConversationsModule } from '../conversations/conversations.module';
import { Message } from '../messages/entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';

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
    ]),
    AuthModule,
    WorkspacesModule,
    UsersModule,
    ChatbotModelsModule,
    UserSubscriptionsModule,
    UsageLogsModule,
    MessagesModule,
  ],
  controllers: [ChatbotsController],
  providers: [ChatbotsService, CheckQuotaInterceptor, Reflector, QuotaService],
  exports: [ChatbotsService],
})
export class ChatbotsModule {}
