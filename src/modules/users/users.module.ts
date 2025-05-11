import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service';
import { UsersController } from '@modules/users/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@modules/users/entities/user.entity';
import { AuthModule } from '@modules/auth/auth.module';
import { ApiTokensModule } from '@modules/api-tokens/api-tokens.module';
import { WorkspacesModule } from '@modules/workspaces/workspaces.module';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';
import { ChatbotsService } from '@modules/chatbots/chatbots.service';
import { ChatbotModelsModule } from '@modules/chatbot-models/chatbot-models.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { ChatbotPromptModule } from '@modules/chatbot-prompt/chatbot-prompt.module';
import { ChatbotResource } from '@modules/chatbots/entities/chatbot-resources.entity';
import { Resource } from '@modules/resources/entities/resource.entity';
import { ChatbotOnboarding } from '@modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '@modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
import { Reflector } from '@nestjs/core';
import { CheckQuotaInterceptor } from '@common/interceptors/usage-logs.interceptor';
import { QuotaService } from '@modules/quota/quota.service';
import { MessagesModule } from '@modules/messages/messages.module';
import { Conversation } from '@modules/conversations/entities/conversation.entity';
import { ChatbotTokensModule } from '@modules/chatbot-tokens/chatbot-tokens.module';
import { WorkspaceMembersModule } from '@modules/workspace-members/workspace-members.module';
import { Domain } from '@modules/domains/entities/domain.entity';
import { ChatbotToken } from '@modules/chatbot-tokens/entities/chatbot-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      ApiToken,
      Chatbot,
      ChatbotResource,
      Resource,
      ChatbotOnboarding,
      OnboardingSuggestedQuestion,
      UserSubscriptions,
      UsageLog,
      Conversation,
      Domain,
      ChatbotToken
    ]),
    AuthModule,
    ApiTokensModule,
    WorkspacesModule,
    ChatbotModelsModule,
    DocumentsModule,
    ChatbotPromptModule,
    SubscriptionsModule,
    UsageLogsModule,
    MessagesModule,
    ChatbotTokensModule,
    forwardRef(() => UserSubscriptionsModule),
    forwardRef(() => ResourcesModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    ChatbotsService,
    CheckQuotaInterceptor,
    Reflector,
    QuotaService,
  ],
  exports: [UsersService],
})
export class UsersModule {}
