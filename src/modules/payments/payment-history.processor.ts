import { BadRequestException, Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentHistoryDto } from './dto/create-payment-history.dto';

@Processor('payment-history')
export class PaymentHistoryProcessor extends WorkerHost {
  private readonly logger = new Logger(PaymentHistoryProcessor.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {
    super();
  }

  async process(job: Job<CreatePaymentHistoryDto>): Promise<void> {
    if (!job.data) {
      this.logger.error('Job data is missing');
      throw new BadRequestException('Job data is missing');
    }

    const data = job.data;
    this.logger.log(
      `Processing payment history for userId=${data.userId}, userSubscriptionId=${data.userSubscriptionId}, amount=${data.amount}, status=${data.status}`,
    );

    try {
      await this.paymentRepository.save({
        user_id: data.userId,
        user_subscriptions: { id: data.userSubscriptionId },
        amount: data.amount,
        status: data.status,
        order_id: data.orderId,
        payment_method: data.paymentMethod,
        sepay_transaction_id: data.sepayTransactionId,
        description: data.description,
        paid_at: data.paidAt,
        raw_webhook: data.rawWebhook,
      });
      this.logger.log(
        `Saved payment history for userId=${data.userId}, userSubscriptionId=${data.userSubscriptionId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save payment history for userId=${data.userId}, userSubscriptionId=${data.userSubscriptionId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
