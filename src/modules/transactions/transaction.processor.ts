import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SePayWebhookDto } from '@modules/transactions/dto/webhook.dto';
import { TransactionsService } from '@modules/transactions/transactions.service';

@Processor('sepay-webhook')
export class SepayWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(SepayWebhookProcessor.name);

  constructor(private readonly transactionsService: TransactionsService) {
    super();
  }

  async process(job: Job<SePayWebhookDto>): Promise<void> {
    this.logger.log(`Processing webhook job ${job.id} with name ${job.name}`);

    try {
      switch (job.name) {
        case 'process-webhook-subscribe':
          await this.transactionsService.processSubscribeSePayTransaction(
            job.data,
          );
          break;
        case 'process-webhook-extend':
          await this.transactionsService.processExtendSePayTransaction(
            job.data,
          );
          break;
        case 'process-webhook-upgrade':
          await this.transactionsService.processUpgradeSePayTransaction(
            job.data,
          );
          break;
        default:
          this.logger.warn(`Unhandled job name: ${job.name}`);
          return;
      }
      this.logger.log(
        `Webhook job ${job.id} (${job.name}) processed successfully`,
      );
    } catch (error) {
      this.logger.error(
        `Webhook job ${job.id} (${job.name}) failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
// This processor handles the processing of SePay webhook jobs.
// It uses the TransactionsService to process different types of transactions