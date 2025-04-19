import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiToken } from '../api-tokens/entities/api-token.entity';
import { ApiTokensService } from '../api-tokens/api-tokens.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PasswordReset } from '../password-reset/entities/password-reset.entity';

@Injectable()
export class CronJobsService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
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
}
