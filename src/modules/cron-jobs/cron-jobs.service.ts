import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiToken } from '@modules/api-tokens/entities/api-token.entity';
import { ApiTokensService } from '@modules/api-tokens/api-tokens.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordReset } from '@modules/password-reset/entities/password-reset.entity';
import { Chatbot, ChatbotStatus } from '@modules/chatbots/entities/chatbot.entity';
import { SubscriptionStatus } from '@modules/user-subscriptions/entities/user-subscriptions.entity';

@Injectable()
export class CronJobsService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    @InjectRepository(PasswordReset)
    private readonly resetRepository: Repository<PasswordReset>,
    private readonly apiTokenService: ApiTokensService,
  ) {}
  private readonly logger = new Logger(CronJobsService.name);

  // Cron create access token every 10p
  @Cron('*/10 * * * *')
  async refreshAccessTokenJob() {
    try {
      this.logger.log('Starting refreshAccessTokenJob');

      const accessToken = await this.apiTokenService.getAccessToken();
      if (!accessToken?.access_token) {
        this.logger.error('Failed to retrieve access token');
        return;
      }

      const tokenEntity = await this.apiTokenRepository.findOne({
        where: {
          id: '1',
        },
      });
      if (!tokenEntity) {
        this.logger.error('Token with ID 1 not found');
        return;
      }

      await this.apiTokenRepository.update(1, {
        token: accessToken.access_token,
        updated_at: new Date(),
      });

      this.logger.log('Access token updated successfully');
    } catch (error) {
      this.logger.error(
        `Failed to refresh access token: ${error.message}`,
        error.stack,
      );
    }
  }

  //Cron remove otp expired
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const now = new Date();
    const result = await this.resetRepository
      .createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where('expires_at < :now', { now })
      .execute();

    if (result.affected && result.affected > 0) {
      this.logger.log(
        `Deleted ${result.affected} expired password reset entries`,
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleChatbotInactiveWhenSubscriptionExpired() {
    const now = new Date();

    await this.chatbotRepository
      .createQueryBuilder()
      .update('chatbots')
      .set({ status: ChatbotStatus.INACTIVE })
      .where(
        `status != :inactive
      AND user_subscription_id IN (
        SELECT us.id FROM user_subscriptions us
        WHERE us.status = :expired
        AND us.end_date < :now
      )`,
        {
          inactive: ChatbotStatus.INACTIVE,
          expired: SubscriptionStatus.EXPIRED,
          now,
        },
      )
      .execute();

    this.logger.log('Inactivated chatbots for expired subscriptions');
  }
}
