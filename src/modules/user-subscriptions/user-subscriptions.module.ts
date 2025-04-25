import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSubscriptions } from './entities/user-subscriptions.entity';
import { Subscription } from '../subscriptions/entities/subscription.entity';
import { User } from '../users/entities/user.entity';
import { UserSubscriptionsService } from './user-subscriptions.service';
import { UserSubscriptionsController } from './user-subscriptions.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserSubscriptions, User]),
    forwardRef(() => UsersModule),
  ],
  providers: [UserSubscriptionsService],
  exports: [UserSubscriptionsService],
  controllers: [UserSubscriptionsController],
})
export class UserSubscriptionsModule {}
