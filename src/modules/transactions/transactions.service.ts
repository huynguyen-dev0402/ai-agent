import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
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
import { UserStatus } from '@modules/users/entities/user.entity';
import {
  calcEndDate,
  parseTransactionContent,
} from '@common/utils/transaction/transaction.util';
import { PaymentStatus } from '@modules/payments/entities/payment.entity';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionsService,
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
    @InjectQueue('sepay-webhook') private readonly sepayQueue: Queue,
    @InjectQueue('payment-history') private readonly paymentHistoryQueue: Queue,
    private readonly eventEmitter: EventEmitter2,
    private dataSource: DataSource,
  ) {}

  async cancelPayment(userId: string) {
    this.logger.log(`Cancel payment requested for userId: ${userId}`);
    const payment = await this.getPaymentPending(userId);
    if (!payment) {
      this.logger.warn(`No pending payment found for userId: ${userId}`);
      throw new NotFoundException('Payment pending not found');
    }
    const result = await this.userSubRepository.delete({ id: payment.id });
    this.logger.log(
      `Canceled payment for userId: ${userId}, result: ${JSON.stringify(result)}`,
    );
    return result;
  }

  async getPaymentPending(userId: string) {
    this.logger.debug(`Fetching pending payment for userId: ${userId}`);
    return this.userSubRepository.findOne({
      where: {
        user: {
          id: userId,
          status: UserStatus.ACTIVE,
        },
        status: SubscriptionStatus.PENDING,
      },
      relations: ['subscription'],
      select: {
        id: true,
        status: true,
        subscription: {
          id: true,
          name: true,
          price: true,
          duration_months: true,
        },
      },
    });
  }

  async generateQR(
    generateQrDto: GenerateQRDto,
  ): Promise<{ qrImageUrl: string; orderId: string }> {
    this.logger.log(
      `Generating QR for user: ${generateQrDto.username}, subscription: ${generateQrDto.subscription_code}, amount: ${generateQrDto.amount}`,
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

    const orderId =
      generateQrDto.order_id ||
      `SEVQR${generateQrDto.action}${generateQrDto.subscription_code}${generateQrDto.username}TS${Date.now()}`;
    this.logger.debug(`Generated orderId: ${orderId}`);

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

  async queueSubscribeSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Queuing subscribe webhook: ${JSON.stringify(sePayWebhookDto)}`,
    );
    await this.sepayQueue.add('process-webhook-subscribe', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.debug('Webhook successfully queued');
    return {
      success: true,
      message: 'Webhook subscribe queued for processing',
    };
  }

  async queueSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Queuing generic webhook: ${JSON.stringify(sePayWebhookDto)}`,
    );
    await this.sepayQueue.add('process-webhook', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.debug('Webhook successfully queued');
    return {
      success: true,
      message: 'Webhook queued for processing',
    };
  }

  async queueExtendSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Queuing extend webhook: ${JSON.stringify(sePayWebhookDto)}`,
    );
    await this.sepayQueue.add('process-webhook-extend', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.debug('Webhook extend successfully queued');
    return { success: true, message: 'Webhook extend queued for processing' };
  }

  async queueUpgradeSePayWebhook(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Queuing upgrade webhook: ${JSON.stringify(sePayWebhookDto)}`,
    );
    await this.sepayQueue.add('process-webhook-upgrade', sePayWebhookDto, {
      attempts: 3,
      backoff: 5000,
    });
    this.logger.debug('Webhook upgrade successfully queued');
    return { success: true, message: 'Webhook upgrade queued for processing' };
  }

  async processSubscribeSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Processing subscribe transaction: ${JSON.stringify(sePayWebhookDto)}`,
    );
    const { subscriptionCode, username } = parseTransactionContent(
      sePayWebhookDto.content,
    );
    return await this.dataSource.transaction(async (manager) => {
      // Tìm subscription đang pending của user
      const userSub = await this.findUserSubscription(manager, {
        username,
        subscriptionCode,
        status: SubscriptionStatus.PENDING,
        amount: sePayWebhookDto.transferAmount,
      });

      if (!userSub) {
        this.logger.warn(
          `User subscription not found for username: ${username}, subscriptionCode: ${subscriptionCode}`,
        );
        // Lưu lịch sử thanh toán thất bại
        // await this.addPaymentHistory({
        //   userId: null,
        //   userSubscriptionId: null,
        //   amount: sePayWebhookDto.transferAmount,
        //   status: PaymentStatus.FAILED,
        //   paymentMethod: 'QR',
        //   orderId: null,
        //   sepayTransactionId: sePayWebhookDto.id,
        //   description: sePayWebhookDto.content,
        //   paidAt: new Date(),
        //   rawWebhook: sePayWebhookDto,
        // });
        throw new NotFoundException('User subscription not found');
      }

      // Kiểm tra duplicate transaction trong transaction context
      const existingTransaction = await manager.findOne(UserSubscriptions, {
        where: { sepay_transaction_id: sePayWebhookDto.id },
      });
      if (existingTransaction) {
        this.logger.warn(
          `Duplicate transaction detected: ${sePayWebhookDto.id}`,
        );
        // await this.addPaymentHistory({
        //   userId: userSub.user.id,
        //   userSubscriptionId: userSub.id,
        //   amount: sePayWebhookDto.transferAmount,
        //   status: PaymentStatus.FAILED,
        //   paymentMethod: 'QR',
        //   orderId: userSub.order_id,
        //   sepayTransactionId: sePayWebhookDto.id,
        //   description: '[DUPLICATE] ' + sePayWebhookDto.content,
        //   paidAt: new Date(),
        //   rawWebhook: sePayWebhookDto,
        // });
        throw new BadRequestException('Duplicate transaction');
      }

      const startDate = new Date();
      const endDate = calcEndDate(
        startDate,
        userSub.subscription.duration_months,
      );

      await manager.update(UserSubscriptions, userSub.id, {
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
        sepay_transaction_id: sePayWebhookDto.id,
        amount: sePayWebhookDto.transferAmount,
      });

      this.emitPaymentStatus(
        userSub.user.id,
        userSub.id,
        SubscriptionStatus.ACTIVE,
        userSub.order_id,
        endDate,
      );

      await this.addPaymentHistory({
        userId: userSub.user.id,
        userSubscriptionId: userSub.id,
        amount: sePayWebhookDto.transferAmount,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'QR',
        orderId: userSub.order_id,
        sepayTransactionId: sePayWebhookDto.id,
        description: sePayWebhookDto.content,
        paidAt: new Date(),
        rawWebhook: sePayWebhookDto,
      });

      this.logger.log(
        `Subscribe transaction processed successfully for transactionId: ${sePayWebhookDto.id}`,
      );
      return { message: 'Transaction processed successfully' };
    });
  }

  async processExtendSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Processing extend transaction: ${JSON.stringify(sePayWebhookDto)}`,
    );
    const { subscriptionCode, username } = parseTransactionContent(
      sePayWebhookDto.content,
    );
    this.logger.debug(
      `Parsed transaction content: subscriptionCode=${subscriptionCode}, username=${username}`,
    );
    return await this.dataSource.transaction(async (manager) => {
      // Tìm subscription đang active của user
      const userSub = await this.findUserSubscription(manager, {
        username,
        subscriptionCode,
        status: SubscriptionStatus.ACTIVE,
        amount: sePayWebhookDto.transferAmount,
      });

      if (!userSub) {
        this.logger.warn(
          `User subscription not found for username: ${username}, subscriptionCode: ${subscriptionCode}`,
        );
        // Lưu lịch sử thanh toán thất bại
        // await this.addPaymentHistory({
        //   userId: null,
        //   userSubscriptionId: null,
        //   amount: sePayWebhookDto.transferAmount,
        //   status: PaymentStatus.FAILED,
        //   paymentMethod: 'QR',
        //   orderId: null,
        //   sepayTransactionId: sePayWebhookDto.id,
        //   description: sePayWebhookDto.content,
        //   paidAt: new Date(),
        //   rawWebhook: sePayWebhookDto,
        // });
        throw new NotFoundException('User subscription not found');
      }

      // Kiểm tra duplicate transaction trong transaction context
      const existingTransaction = await manager.findOne(UserSubscriptions, {
        where: { sepay_transaction_id: sePayWebhookDto.id },
      });
      if (existingTransaction) {
        this.logger.warn(
          `Duplicate transaction detected: ${sePayWebhookDto.id}`,
        );
        // Lưu lịch sử thanh toán thất bại
        // await this.addPaymentHistory({
        //   userId: userSub.user.id,
        //   userSubscriptionId: userSub.id,
        //   amount: sePayWebhookDto.transferAmount,
        //   status: PaymentStatus.FAILED,
        //   paymentMethod: 'QR',
        //   orderId: userSub.order_id,
        //   sepayTransactionId: sePayWebhookDto.id,
        //   description: '[DUPLICATE] ' + sePayWebhookDto.content,
        //   paidAt: new Date(),
        //   rawWebhook: sePayWebhookDto,
        // });
        throw new BadRequestException('Duplicate transaction');
      }

      const endDate = calcEndDate(
        new Date(userSub.end_date),
        userSub.subscription?.duration_months,
      );

      await manager.update(UserSubscriptions, userSub.id, {
        end_date: endDate,
        sepay_transaction_id: sePayWebhookDto.id,
        amount: sePayWebhookDto.transferAmount,
      });

      this.emitPaymentStatus(
        userSub.user.id,
        userSub.id,
        SubscriptionStatus.ACTIVE,
        userSub.order_id,
        endDate,
      );

      await this.addPaymentHistory({
        userId: userSub.user.id,
        userSubscriptionId: userSub.id,
        amount: sePayWebhookDto.transferAmount,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'QR',
        orderId: userSub.order_id,
        sepayTransactionId: sePayWebhookDto.id,
        description: sePayWebhookDto.content,
        paidAt: new Date(),
        rawWebhook: sePayWebhookDto,
      });

      this.logger.log(
        `Extend transaction processed successfully for transactionId: ${sePayWebhookDto.id}`,
      );
      return { message: 'Transaction processed successfully' };
    });
  }

  async processUpgradeSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    this.logger.log(
      `Processing upgrade transaction: ${JSON.stringify(sePayWebhookDto)}`,
    );
    const { subscriptionCode, username } = parseTransactionContent(
      sePayWebhookDto.content,
    );

    return await this.dataSource.transaction(async (manager) => {
      // Tìm gói mới (pending)
      const newUserSub = await this.findUserSubscription(manager, {
        username,
        subscriptionCode,
        status: SubscriptionStatus.PENDING,
        amount: sePayWebhookDto.transferAmount,
      });

      if (!newUserSub) {
        this.logger.warn(
          `User subscription not found for username: ${username}, subscriptionCode: ${subscriptionCode}`,
        );
        // Lưu lịch sử thanh toán thất bại
        // await this.addPaymentHistory({
        //   userId: null,
        //   userSubscriptionId: null,
        //   amount: sePayWebhookDto.transferAmount,
        //   status: PaymentStatus.FAILED,
        //   paymentMethod: 'QR',
        //   orderId:null,
        //   sepayTransactionId: sePayWebhookDto.id,
        //   description: sePayWebhookDto.content,
        //   paidAt: new Date(),
        //   rawWebhook: sePayWebhookDto,
        // });
        throw new NotFoundException('User subscription not found');
      }

      // Kiểm tra duplicate transaction trong transaction context
      await this.ensureNoDuplicateTransaction(manager, sePayWebhookDto.id);

      // Cancel old active subscription if exists
      const oldUserSub = await manager.findOne(UserSubscriptions, {
        where: {
          user: { username },
          status: SubscriptionStatus.ACTIVE,
        },
        relations: ['subscription'],
        select: {
          id: true,
          order_id: true,
          start_date: true,
          end_date: true,
          subscription: {
            id: true,
            duration_months: true,
          },
        },
      });

      if (oldUserSub) {
        await manager.update(UserSubscriptions, oldUserSub.id, {
          status: SubscriptionStatus.CANCELED,
          end_date: new Date(),
        });
        // this.emitPaymentStatus(
        //   oldUserSub.user.id,
        //   oldUserSub.id,
        //   SubscriptionStatus.CANCELED,
        //   oldUserSub.order_id,
        //   oldUserSub.end_date,
        // );
        this.logger.log(
          `Canceled old active subscription for user: ${username}, oldSubId: ${oldUserSub.id}`,
        );
      }

      try {
        await manager.update(UserSubscriptions, newUserSub.id, {
          status: SubscriptionStatus.ACTIVE,
          sepay_transaction_id: sePayWebhookDto.id,
          amount: sePayWebhookDto.transferAmount,
        });

        this.emitPaymentStatus(
          newUserSub.user.id,
          newUserSub.id,
          SubscriptionStatus.ACTIVE,
          newUserSub.order_id,
          newUserSub.end_date,
        );

        // Lưu lịch sử thanh toán thành công
        await this.addPaymentHistory({
          userId: newUserSub.user.id,
          userSubscriptionId: newUserSub.id,
          amount: sePayWebhookDto.transferAmount,
          status: PaymentStatus.COMPLETED,
          paymentMethod: 'QR',
          orderId: newUserSub.order_id,
          sepayTransactionId: sePayWebhookDto.id,
          description: sePayWebhookDto.content,
          paidAt: new Date(),
          rawWebhook: sePayWebhookDto,
        });

        this.logger.log(
          `Upgrade transaction processed successfully for transactionId: ${sePayWebhookDto.id}`,
        );

        return { message: 'Transaction processed successfully' };
      } catch (error) {
        if (oldUserSub) {
          await manager.update(UserSubscriptions, oldUserSub.id, {
            status: SubscriptionStatus.ACTIVE,
            end_date: oldUserSub.end_date,
          });
          this.logger.warn(
            `Upgrade failed, restored old subscription ${oldUserSub.id} to ACTIVE`,
          );
        }
        this.logger.error(
          `Upgrade transaction failed for transactionId: ${sePayWebhookDto.id}: ${error.message}`,
        );
        await this.addPaymentHistory({
          userId: newUserSub.user.id,
          userSubscriptionId: newUserSub.id,
          amount: sePayWebhookDto.transferAmount,
          status: PaymentStatus.FAILED,
          paymentMethod: 'QR',
          orderId: newUserSub.order_id,
          sepayTransactionId: sePayWebhookDto.id,
          description: '[UPGRADE_FAILED] ' + sePayWebhookDto.content,
          paidAt: new Date(),
          rawWebhook: sePayWebhookDto,
        });
        throw error;
      }
    });
  }

  // --- PRIVATE HELPERS ---

  private async addPaymentHistory(data: {
    userId: string | null;
    userSubscriptionId: string | null;
    amount: number;
    status: PaymentStatus;
    paymentMethod?: string;
    orderId?: string | null;
    sepayTransactionId?: number;
    description?: string;
    paidAt?: Date;
    rawWebhook?: any;
  }) {
    await this.paymentHistoryQueue.add('payment-history', data, {
      attempts: 3,
      backoff: 5000,
      removeOnComplete: true,
    });
  }

  private async ensureNoDuplicateTransaction(
    repoOrManager: Repository<UserSubscriptions> | EntityManager,
    sepayTransactionId: number,
  ) {
    const existingTransaction = await repoOrManager.findOne(UserSubscriptions, {
      where: { sepay_transaction_id: sepayTransactionId },
    });
    if (existingTransaction) {
      this.logger.warn(`Duplicate transaction detected: ${sepayTransactionId}`);
      throw new BadRequestException('Duplicate transaction');
    }
    this.logger.debug(
      `No duplicate transaction found for id: ${sepayTransactionId}`,
    );
  }

  private async updateUserSubscription(
    repoOrManager: Repository<UserSubscriptions> | any,
    id: string,
    updateData: Partial<UserSubscriptions>,
  ) {
    this.logger.debug(
      `Updating user subscription id: ${id} with data: ${JSON.stringify(updateData)}`,
    );
    const response = await repoOrManager.update(
      UserSubscriptions,
      id,
      updateData,
    );
    if (response.affected === 0) {
      this.logger.error(
        `Failed to update user subscription status for id: ${id}`,
      );
      throw new BadRequestException(
        'Failed to update user subscription status',
      );
    }
    this.logger.debug(`Updated user subscription status for id: ${id}`);
  }

  private emitPaymentStatus(
    userId: string,
    subscriptionId: string,
    status: SubscriptionStatus,
    orderId?: string,
    endDate?: Date,
  ) {
    this.logger.debug(
      `Emitting payment.status event: userId=${userId}, subscriptionId=${subscriptionId}, status=${status}, orderId=${orderId}, endDate=${endDate}`,
    );
    this.eventEmitter.emit('payment.status', {
      userId,
      subscriptionId,
      status,
      endDate,
      orderId,
    });
  }

  private async findUserSubscription(
    repoOrManager: Repository<UserSubscriptions> | EntityManager,
    {
      username,
      subscriptionCode,
      status,
      amount,
    }: {
      username: string;
      subscriptionCode: string;
      status: SubscriptionStatus;
      amount: number;
    },
  ) {
    this.logger.debug(
      `Finding user subscription: username=${username}, subscriptionCode=${subscriptionCode}, status=${status}, amount=${amount}`,
    );
    return repoOrManager.findOne(UserSubscriptions, {
      where: {
        user: { username },
        subscription: { subscription_code: Number(subscriptionCode) },
        status,
        amount,
      },
      relations: {
        subscription: true,
        user: true,
      },
      select: {
        id: true,
        order_id: true,
        start_date: true,
        subscription: {
          id: true,
          duration_months: true,
        },
        user: {
          id: true,
        },
      },
    });
  }
}
