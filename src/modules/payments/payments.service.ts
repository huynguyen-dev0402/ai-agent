import {
  Injectable,
  BadRequestException,
  Logger,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from './entities/payment.entity';
import {
  SubscriptionStatus,
  UserSubscriptions,
} from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
    @Inject(forwardRef(() => UserSubscriptionsService))
    private readonly userSubscriptionsService: UserSubscriptionsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async initiateSepayPayment(
    subscriptionId: string,
    userId: string,
    userSubscriptionId: string,
  ): Promise<{ paymentUrl: string; paymentId: string }> {
    this.logger.log(
      `Initiating Sepay payment for user ${userId}, subscription ${userSubscriptionId}`,
    );

    const subscription =
      await this.subscriptionsService.findOne(subscriptionId);
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const payment = await this.paymentsRepository.save({
      user: { id: userId },
      userSubscription: { id: userSubscriptionId },
      amount: subscription.price,
      currency: 'VND',
      payment_method: 'sepay',
      payment_status: 'pending',
      transaction_id: `SEPAY_${uuidv4()}`,
    });

    try {
      const response = await fetch('https://api.sepay.vn/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer YOUR_API_KEY`,
        },
        body: JSON.stringify({
          order_id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          callback_url: `https://api.chatifly.com/sepay/webhook`,
          description: `Thanh toán gói ${subscription.name}`,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Sepay API error: ${response.statusText}`);
        throw new BadRequestException(
          `Sepay API error: ${response.statusText}`,
        );
      }

      const sepayResponse = await response.json();
      const paymentUrl = sepayResponse.payment_url;

      if (!paymentUrl) {
        this.logger.error('Payment URL missing from Sepay response');
        throw new BadRequestException(
          'Payment URL missing from Sepay response',
        );
      }

      await this.paymentsRepository.update(payment.id, {
        transaction_id: sepayResponse.transaction_id || payment.transaction_id,
      });

      return { paymentUrl, paymentId: payment.id };
    } catch (error) {
      this.logger.error(`Failed to initiate Sepay payment: ${error.message}`);
      throw new BadRequestException(
        `Failed to initiate Sepay payment: ${error.message}`,
      );
    }
  }

  async create(paymentData: Partial<Payment>): Promise<Payment> {
    return this.paymentsRepository.save(paymentData);
  }

  async findOne(where: Partial<Payment>): Promise<Payment | null> {
    return this.paymentsRepository.findOne({ where });
  }

  async update(id: string, data: Partial<Payment>): Promise<void> {
    await this.paymentsRepository.update(id, data);
  }
}
