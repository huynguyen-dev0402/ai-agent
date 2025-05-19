import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WebhookUtils } from '@common/utils/webhook/webhook.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserSubscriptions]),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WebhookUtils],
  exports: [TransactionsService],
})
export class TransactionsModule {}
