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

    if (job.name === 'process-webhook') {
      try {
        await this.transactionsService.processSePayTransaction(job.data);
        this.logger.log(`Webhook job ${job.id} processed successfully`);
      } catch (error) {
        this.logger.error(`Webhook job ${job.id} failed: ${error.message}`);
        throw error;
      }
    } else {
      this.logger.warn(`Unhandled job name: ${job.name}`);
    }
  }
}
