import { Module } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { FeaturesController } from './features.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Feature } from './entities/feature.entity';
import { SubscriptionFeatures } from '../subscription-features/entities/subscription-features.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Feature, SubscriptionFeatures])],
  controllers: [FeaturesController],
  providers: [FeaturesService],
})
export class FeaturesModule {}
