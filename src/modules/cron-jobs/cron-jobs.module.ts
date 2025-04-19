import { Module } from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApiTokensModule } from '../api-tokens/api-tokens.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { PasswordReset } from '../password-reset/entities/password-reset.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([ApiToken, PasswordReset]),
    ApiTokensModule,
  ],
  providers: [CronJobsService],
})
export class CronJobsModule {}
