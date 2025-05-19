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
  ) {}
}
