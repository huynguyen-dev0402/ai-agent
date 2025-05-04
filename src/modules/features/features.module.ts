import { Module } from '@nestjs/common';
import { FeaturesService } from '@modules/features/features.service';
import { FeaturesController } from '@modules/features/features.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from '@modules/features/entities/feature.entity';
import { SubscriptionFeatures } from '@modules/subscription-features/entities/subscription-features.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature, SubscriptionFeatures])],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
