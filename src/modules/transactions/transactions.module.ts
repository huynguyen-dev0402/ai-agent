import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WebhookUtils } from '@common/utils/webhook/webhook.util';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService, WebhookUtils],
})
export class TransactionsModule {}
