import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionFeatures } from '../subscription-features/entities/subscription-features.entity';
import { Feature } from '../features/entities/feature.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feature, SubscriptionFeatures, Subscription]),
  ],
})
export class SubscriptionFeaturesModule {}
