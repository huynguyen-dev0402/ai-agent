import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentLogs } from './entities/payment-log.entity';
import { UserSubscriptionsModule } from '@modules/user-subscriptions/user-subscriptions.module';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, PaymentLogs, UserSubscriptions, Subscription]),
    forwardRef(() => UserSubscriptionsModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
