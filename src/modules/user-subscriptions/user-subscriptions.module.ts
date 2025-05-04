import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { User } from '@modules/users/entities/user.entity';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { UserSubscriptionsController } from '@modules/user-subscriptions/user-subscriptions.controller';
import { UsersModule } from '@modules/users/users.module';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserSubscriptions, User, UsageLog]),
    forwardRef(() => UsersModule),
  ],
  providers: [UserSubscriptionsService],
  exports: [UserSubscriptionsService],
  controllers: [UserSubscriptionsController],
})
export class UserSubscriptionsModule {}
