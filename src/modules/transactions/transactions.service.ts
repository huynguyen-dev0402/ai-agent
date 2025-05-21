import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import {
  SubscriptionStatus,
  UserSubscriptions,
} from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionsService,
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
    @InjectQueue('sepay-webhook') private readonly sepayQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async generateQR(
    generateQrDto: GenerateQRDto,
  ): Promise<{ qrImageUrl: string; orderId: string }> {
    const acc = this.configService.get<string>('ACCOUNT');
    const bank = this.configService.get<string>('BANK');

    if (!acc) {
      throw new InternalServerErrorException(
        'Environment variable ACCOUNT is not set.',
      );
    }
    if (!bank) {
      throw new InternalServerErrorException(
        'Environment variable BANK is not set.',
      );
    }

    if (generateQrDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    const subscription = await this.subscriptionService.findOne(
      generateQrDto.subscription_id,
    );
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const userSub = await this.userSubRepository.findOne({
      where: {
        user: { id: generateQrDto.user_id },
        subscription: { id: generateQrDto.subscription_id },
        status: SubscriptionStatus.PENDING,
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          username: true,
        },
        order_id: true,
      },
    });
    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }

    const orderId =
      userSub.order_id ||
      `SEVQR${subscription.subscription_code}.${userSub.user.username}`;
    await this.userSubRepository.update(userSub.id, { order_id: orderId });

    const encodedDescription = encodeURIComponent(orderId);

    const params = new URLSearchParams({
      acc,
      bank,
      amount: generateQrDto.amount.toString(),
      des: encodedDescription,
      template: generateQrDto.template || 'compact',
    });

    if (generateQrDto?.download) {
      params.append('download', generateQrDto.download);
    }

    const qrImageUrl = `https://qr.sepay.vn/img?${params.toString()}`;

    return { qrImageUrl, orderId };
  }

  async queueSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    await this.sepayQueue.add('process-webhook', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    return { success: true, message: 'Webhook queued for processing' };
  }

  async processSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    const str = sePayWebhookDto.content;
    const regex = /SEVQR(\d{4})(user\d+)/;
    const match = str.match(regex);

    if (!match) {
      throw new BadRequestException('Invalid transaction content format');
    }

    const subscriptionCode = match[1];
    const username = match[2];

    const userSub = await this.userSubRepository.findOne({
      where: {
        user: { username },
        subscription: { subscription_code: Number(subscriptionCode) },
        status: SubscriptionStatus.PENDING,
        amount: sePayWebhookDto.transferAmount,
      },
      relations: {
        subscription: true,
        user: true,
      },
      select: {
        id: true,
        order_id: true,
        subscription: {
          id: true,
          duration_months: true,
        },
        user: {
          id: true,
        },
      },
    });

    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }

    // Prevent duplicate transactions
    const existingTransaction = await this.userSubRepository.findOne({
      where: { sepay_transaction_id: sePayWebhookDto.id },
    });
    if (existingTransaction) {
      throw new BadRequestException('Duplicate transaction');
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(
      startDate.getMonth() + userSub.subscription.duration_months,
    );

    const response = await this.userSubRepository.update(userSub.id, {
      start_date: startDate,
      end_date: endDate,
      status: SubscriptionStatus.ACTIVE,
      sepay_transaction_id: sePayWebhookDto.id,
      amount: sePayWebhookDto.transferAmount,
    });

    if (response.affected === 0) {
      throw new BadRequestException(
        'Failed to update user subscription status',
      );
    }

    // Emit event for SSE
    this.eventEmitter.emit('payment.status', {
      userId: userSub.user.id,
      subscriptionId: userSub.id,
      status: SubscriptionStatus.ACTIVE,
      orderId: userSub.order_id,
    });

    return { message: 'Transaction processed successfully' };
  }
}
