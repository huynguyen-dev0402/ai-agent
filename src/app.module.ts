import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatbotsModule } from './modules/chatbots/chatbots.module';
import { ChatbotModelsModule } from './modules/chatbot-models/chatbot-models.module';
import { ChatbotKnowledgeModule } from './modules/chatbot-knowledge/chatbot-knowledge.module';
import { ApiTokensModule } from './modules/api-tokens/api-tokens.module';
import { ChatbotConfigsModule } from './modules/chatbot-configs/chatbot-configs.module';
import { ChatbotOnboardingModule } from './modules/chatbot-onboarding/chatbot-onboarding.module';
import { OnboardingSuggestedQuestionsModule } from './modules/onboarding-suggested-questions/onboarding-suggested-questions.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { ChatbotPublishedModule } from './modules/chatbot_published/chatbot_published.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { UploadModule } from './modules/upload/upload.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ChatbotPromptModule } from './modules/chatbot-prompt/chatbot-prompt.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { MailModule } from './modules/emails/email.module';

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
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      //synchronize: true,
      //logging: true,
    }),
    ScheduleModule.forRoot(),
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
    ChatbotPromptModule,
    PasswordResetModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
