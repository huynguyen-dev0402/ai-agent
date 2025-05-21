import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
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
  private readonly logger = new Logger(TransactionsService.name);

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
    this.logger.log(
      `Generating QR code for userId: ${generateQrDto.user_id}, subscriptionId: ${generateQrDto.subscription_id}`,
    );

    const acc = this.configService.get<string>('ACCOUNT');
    const bank = this.configService.get<string>('BANK');

    if (!acc) {
      this.logger.error('Environment variable ACCOUNT is not set');
      throw new InternalServerErrorException(
        'Environment variable ACCOUNT is not set.',
      );
    }
    if (!bank) {
      this.logger.error('Environment variable BANK is not set');
      throw new InternalServerErrorException(
        'Environment variable BANK is not set.',
      );
    }

    if (generateQrDto.amount <= 0) {
      this.logger.warn(`Invalid amount: ${generateQrDto.amount}`);
      throw new BadRequestException('Amount must be greater than zero.');
    }

    const subscription = await this.subscriptionService.findOne(
      generateQrDto.subscription_id,
    );
    if (!subscription) {
      this.logger.warn(
        `Subscription not found: ${generateQrDto.subscription_id}`,
      );
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
      this.logger.warn(
        `User subscription not found for userId: ${generateQrDto.user_id}, subscriptionId: ${generateQrDto.subscription_id}`,
      );
      throw new NotFoundException('User subscription not found');
    }

    const orderId =
      userSub.order_id ||
      `SEVQR${subscription.subscription_code}${userSub.user.username}`;
    this.logger.debug(`Generated orderId: ${orderId}`);
    await this.userSubRepository.update(userSub.id, { order_id: orderId });
    this.logger.debug(`Updated user subscription with orderId: ${orderId}`);

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
    this.logger.log(`Generated QR image URL: ${qrImageUrl}`);

    return { qrImageUrl, orderId };
  }

  async queueSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(`Queuing SePay webhook`, { payload: sePayWebhookDto });
    await this.sepayQueue.add('process-webhook', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.debug('Webhook successfully queued');
    return { success: true, message: 'Webhook queued for processing' };
  }

  async processSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(`Processing SePay transaction`, {
      transactionId: sePayWebhookDto.id,
    });

    const str = sePayWebhookDto.content;
    const regex = /SEVQR(\d{4})(user\d+)/;
    const match = str.match(regex);

    if (!match) {
      this.logger.warn(`Invalid transaction content format: ${str}`);
      throw new BadRequestException('Invalid transaction content format');
    }

    const subscriptionCode = match[1];
    const username = match[2];
    this.logger.debug(
      `Extracted subscriptionCode: ${subscriptionCode}, username: ${username}`,
    );

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
      this.logger.warn(
        `User subscription not found for username: ${username}, subscriptionCode: ${subscriptionCode}`,
      );
      throw new NotFoundException('User subscription not found');
    }

    // Prevent duplicate transactions
    const existingTransaction = await this.userSubRepository.findOne({
      where: { sepay_transaction_id: sePayWebhookDto.id },
    });
    if (existingTransaction) {
      this.logger.warn(`Duplicate transaction detected: ${sePayWebhookDto.id}`);
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
      this.logger.error(
        `Failed to update user subscription status for id: ${userSub.id}`,
      );
      throw new BadRequestException(
        'Failed to update user subscription status',
      );
    }

    this.logger.debug(
      `Updated user subscription status to ACTIVE for id: ${userSub.id}`,
    );

    // Emit event for SSE
    this.eventEmitter.emit('payment.status', {
      userId: userSub.user.id,
      subscriptionId: userSub.id,
      status: SubscriptionStatus.ACTIVE,
      orderId: userSub.order_id,
    });
    this.logger.debug(
      `Emitted payment.status event for userId: ${userSub.user.id}`,
    );

    this.logger.log(
      `Transaction processed successfully for transactionId: ${sePayWebhookDto.id}`,
    );
    return { message: 'Transaction processed successfully' };
  }
}
