import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import { SubscriptionsController } from '@modules/subscriptions/subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionFeatures } from '@modules/subscription-features/entities/subscription-features.entity';
import { User } from '@modules/users/entities/user.entity';
import { SuperAdminGuard } from '@modules/author/guards/super-admin.guard';
import { AuthModule } from '@modules/auth/auth.module';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { UsageLogsModule } from '@modules/usage-logs/usage-logs.module';
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
