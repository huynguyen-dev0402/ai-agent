import {
  forwardRef,
  Module,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { Chatbot } from '../chatbots/entities/chatbot.entity';
import { ChatbotsService } from '../chatbots/chatbots.service';
import { ChatbotModelsModule } from '../chatbot-models/chatbot-models.module';
import { ResourcesModule } from '../resources/resources.module';
import { UploadModule } from '../upload/upload.module';
import { DocumentsModule } from '../documents/documents.module';
import { ChatbotPromptModule } from '../chatbot-prompt/chatbot-prompt.module';
import { ChatbotResource } from '../chatbots/entities/chatbot-resources.entity';
import { Resource } from '../resources/entities/resource.entity';
import { ChatbotOnboarding } from '../chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from '../onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { UserSubscriptions } from '../user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { UserSubscriptionsModule } from '../user-subscriptions/user-subscriptions.module';
import { UsageLog } from '../usage-logs/entities/usage-log.entity';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
import { Reflector } from '@nestjs/core';
import { CheckQuotaInterceptor } from 'src/common/interceptors/usage-logs.interceptor';
import { QuotaService } from '../quota/quota.service';

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
    ]),
    AuthModule,
    ApiTokensModule,
    WorkspacesModule,
    ChatbotModelsModule,
    UploadModule,
    DocumentsModule,
    ChatbotPromptModule,
    SubscriptionsModule,
    UsageLogsModule,
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
