import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { UserSubscriptions } from '../user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionFeatures } from '../subscription-features/entities/subscription-features.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      UserSubscriptions,
      SubscriptionFeatures,
    ]),
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
