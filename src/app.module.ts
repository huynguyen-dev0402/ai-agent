import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/entities/user.entity';
import { CustomersModule } from './modules/customers/customers.module';
import { Customer } from './modules/customers/entities/customer.entity';
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
        Customer,
        Chatbot,
        ApiToken,
        ChatbotModel,
        ChatbotConfig,
        ChatbotOnboarding,
        OnboardingSuggestedQuestion,
      ],
      synchronize: true,
      //logging: true,
    }),
    UsersModule,
    AuthModule,
    CustomersModule,
    ChatbotsModule,
    ChatbotModelsModule,
    ChatbotKnowledgeModule,
    ApiTokensModule,
    ChatbotConfigsModule,
    ChatbotOnboardingModule,
    OnboardingSuggestedQuestionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
