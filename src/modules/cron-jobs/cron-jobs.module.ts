import { Module } from '@nestjs/common';
import { CronJobsService } from '@modules/cron-jobs/cron-jobs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ApiTokensModule } from '@modules/api-tokens/api-tokens.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { PasswordReset } from '@modules/password-reset/entities/password-reset.entity';
import { Chatbot } from '@modules/chatbots/entities/chatbot.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ApiToken, PasswordReset, Chatbot]),
    ApiTokensModule,
  ],
  providers: [CronJobsService],
})
export class CronJobsModule {}
