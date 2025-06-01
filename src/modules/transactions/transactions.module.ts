import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { WebhookUtils } from '@common/utils/webhook/webhook.util';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { SubscriptionsModule } from '@modules/subscriptions/subscriptions.module';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SepayWebhookProcessor } from './transaction.processor';
import { PaymentsModule } from '@modules/payments/payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Subscription, UserSubscriptions]),
    forwardRef(() => SubscriptionsModule),
    EventEmitterModule.forRoot(),
    PaymentsModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: 'sepay-webhook',
    }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WebhookUtils, SepayWebhookProcessor],
  exports: [TransactionsService],
})
export class TransactionsModule {}
