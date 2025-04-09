import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/entities/user.entity';
import { ChatbotsModule } from './modules/chatbots/chatbots.module';
import { Chatbot } from './modules/chatbots/entities/chatbot.entity';
import { ChatbotModelsModule } from './modules/chatbot-models/chatbot-models.module';
import { ChatbotKnowledgeModule } from './modules/chatbot-knowledge/chatbot-knowledge.module';
import { ApiTokensModule } from './modules/api-tokens/api-tokens.module';
import { ApiToken } from './modules/api-tokens/entities/api-token.entity';
import { ChatbotModel } from './modules/chatbot-models/entities/chatbot-model.entity';
import { ChatbotConfigsModule } from './modules/chatbot-configs/chatbot-configs.module';
import { ChatbotOnboardingModule } from './modules/chatbot-onboarding/chatbot-onboarding.module';
import { OnboardingSuggestedQuestionsModule } from './modules/onboarding-suggested-questions/onboarding-suggested-questions.module';
import { ChatbotOnboarding } from './modules/chatbot-onboarding/entities/chatbot-onboarding.entity';
import { OnboardingSuggestedQuestion } from './modules/onboarding-suggested-questions/entities/onboarding-suggested-question.entity';
import { ChatbotConfig } from './modules/chatbot-configs/entities/chatbot-config.entity';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ChatbotPublishedModule } from './modules/chatbot_published/chatbot_published.module';
import { Workspace } from './modules/workspaces/entities/workspace.entity';
import { ChatbotPublished } from './modules/chatbot_published/entities/chatbot_published.entity';
import { ResourcesModule } from './modules/resources/resources.module';
import { Resource } from './modules/resources/entities/resource.entity';
import { UploadModule } from './modules/upload/upload.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { Document } from './modules/documents/entities/document.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        User,
        Chatbot,
        ApiToken,
        Workspace,
        Resource,
        Document,
        ChatbotPublished,
        ChatbotModel,
        ChatbotConfig,
        ChatbotOnboarding,
        OnboardingSuggestedQuestion,
      ],
      //synchronize: true,
      //logging: true,
    }),
    UsersModule,
    AuthModule,
    ChatbotsModule,
    ChatbotModelsModule,
    ChatbotKnowledgeModule,
    ApiTokensModule,
    ChatbotConfigsModule,
    ChatbotOnboardingModule,
    OnboardingSuggestedQuestionsModule,
    WorkspacesModule,
    ChatbotPublishedModule,
    ResourcesModule,
    UploadModule,
    DocumentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
