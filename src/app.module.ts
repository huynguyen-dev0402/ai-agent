import { ApiTokensModule } from '@modules/api-tokens/api-tokens.module';
import { AuthModule } from '@modules/auth/auth.module';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AuthorModule } from '@modules/author/author.module';
import { ChatbotModelsModule } from '@modules/chatbot-models/chatbot-models.module';
import { ChatbotOnboardingModule } from '@modules/chatbot-onboarding/chatbot-onboarding.module';
import { ChatbotPromptModule } from '@modules/chatbot-prompt/chatbot-prompt.module';
import { ChatbotsModule } from '@modules/chatbots/chatbots.module';
import { ConversationsModule } from '@modules/conversations/conversations.module';
import { CronJobsModule } from '@modules/cron-jobs/cron-jobs.module';
import { DocumentsModule } from '@modules/documents/documents.module';
import { MailModule } from '@modules/emails/email.module';
import { EndUsersModule } from '@modules/end-users/end-users.module';
import { FeaturesModule } from '@modules/features/features.module';
import { MessagesModule } from '@modules/messages/messages.module';
import { OnboardingSuggestedQuestionsModule } from '@modules/onboarding-suggested-questions/onboarding-suggested-questions.module';
import { PasswordResetModule } from '@modules/password-reset/password-reset.module';
import { ResourcesModule } from '@modules/resources/resources.module';
import { SubscriptionFeaturesModule } from '@modules/subscription-features/subscription-features.module';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { TransactionsModule } from '@modules/transactions/transactions.module';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { UsersModule } from '@modules/users/users.module';
import { WorkspacesModule } from '@modules/workspaces/workspaces.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatbotEmbedModule } from './modules/chatbot-embed/chatbot-embed.module';
import { ChatbotTokensModule } from './modules/chatbot-tokens/chatbot-tokens.module';
import { DomainsModule } from './modules/domains/domains.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TicketMessagesModule } from './modules/ticket-messages/ticket-messages.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { WorkspaceMembersModule } from './modules/workspace-members/workspace-members.module';

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
      // synchronize: true,
      // logging: true,
    }),
    UsersModule,
    AuthModule,
    ChatbotsModule,
    ChatbotModelsModule,
    ApiTokensModule,
    ChatbotOnboardingModule,
    OnboardingSuggestedQuestionsModule,
    WorkspacesModule,
    ResourcesModule,
    DocumentsModule,
    ChatbotPromptModule,
    PasswordResetModule,
    MailModule,
    CronJobsModule,
    AuthorModule,
    SubscriptionsModule,
    FeaturesModule,
    SubscriptionFeaturesModule,
    UserSubscriptionsModule,
    UsageLogsModule,
    ConversationsModule,
    MessagesModule,
    EndUsersModule,
    ChatbotTokensModule,
    ChatbotEmbedModule,
    WorkspaceMembersModule,
    TicketsModule,
    DomainsModule,
    PaymentsModule,
    TransactionsModule,
    TicketMessagesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
