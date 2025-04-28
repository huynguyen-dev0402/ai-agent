import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { UserSubscriptions } from '../user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionFeatures } from '../subscription-features/entities/subscription-features.entity';
import { User } from '../users/entities/user.entity';
import { SuperAdminGuard } from '../author/guards/super-admin.guard';
import { AuthModule } from '../auth/auth.module';
import { UserSubscriptionsModule } from '../user-subscriptions/user-subscriptions.module';
import { UsageLogsModule } from '../usage-logs/usage-logs.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      UserSubscriptions,
      SubscriptionFeatures,
      User,
    ]),
    AuthModule,
    UserSubscriptionsModule,
    UsageLogsModule,
  ],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, SuperAdminGuard],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
