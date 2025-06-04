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
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '@modules/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentLogs,
      UserSubscriptions,
      Subscription,
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'payment-history',
    }),
    AuthModule,
    forwardRef(() => UserSubscriptionsModule),
    forwardRef(() => SubscriptionsModule),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, BullModule],
})
export class PaymentsModule {}
