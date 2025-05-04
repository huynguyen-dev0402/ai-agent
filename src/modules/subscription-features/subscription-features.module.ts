import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionFeatures } from '@modules/subscription-features/entities/subscription-features.entity';
import { Feature } from '@modules/features/entities/feature.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Feature, SubscriptionFeatures, Subscription]),
  ],
})
export class SubscriptionFeaturesModule {}
