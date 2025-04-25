import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscriptions } from './entities/user-subscriptions.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { UserSubscriptionsService } from './user-subscriptions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription, UserSubscriptions, User])],
  providers: [UserSubscriptionsService],
  exports: [UserSubscriptionsService],
})
export class UserSubscriptionsModule {}
