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
import { DEFAULT_PAYMENT_LIMIT, DEFAULT_PAYMENT_OFFSET, DEFAULT_PAYMENT_ORDER, DEFAULT_PAYMENT_SORT, GetPaymentsQueryDto } from './dto/get-payment-query.dto';

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

  async getPaymentById(paymentId: string): Promise<Payment | null> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
      relations: {
        user_subscriptions: {
          user: true,
          subscription: true,
        },
      },
      select: {
        id: true,
        amount: true,
        status: true,
        payment_method: true,
        description: true,
        created_at: true,
        updated_at: true,
        user_subscriptions: {
          id: true,
          status: true,
          start_date: true,
          end_date: true,
          created_at: true,
          user: {
            id: true,
            username: true, // Assuming you want to include username
          },
          subscription: {
            id: true,
            name: true, // Assuming you want to include subscription name
            price: true, // Assuming you want to include subscription price
          },
        },
      },
    });

    if (!payment) {
      this.logger.warn(`Payment with ID ${paymentId} not found`);
      return null;
    }

    return payment;
  }

  async getPaymentsByUserId(userId: string, query: GetPaymentsQueryDto): Promise<Payment[]> {
    const {
      limit = DEFAULT_PAYMENT_LIMIT,
      offset = DEFAULT_PAYMENT_OFFSET,
      sort = DEFAULT_PAYMENT_SORT,
      order = DEFAULT_PAYMENT_ORDER,
    } = query;

    const payments = await this.paymentsRepository.find({
      where: { user_id: userId },
      select: {
        id: true,
        amount: true,
        status: true,
        payment_method: true,
        description: true,
        created_at: true,
        updated_at: true,
      },
      order: { [sort]: order },
      take: limit,
      skip: offset,
    });

    return payments;
  }
}
