import { Logger } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SePayWebhookDto } from '@modules/transactions/dto/webhook.dto';
import { TransactionsService } from '@modules/transactions/transactions.service';
import { parseTransactionContent } from '@common/utils/transaction/transaction.util';

@Processor('sepay-webhook')
export class SepayWebhookProcessor extends WorkerHost {
  private readonly logger = new Logger(SepayWebhookProcessor.name);

  constructor(private readonly transactionsService: TransactionsService) {
    super();
  }

  async process(job: Job<SePayWebhookDto>): Promise<void> {
    this.logger.log(`Processing webhook job ${job.id} with name ${job.name}`);

    try {
      const { content } = job.data;
      const { action } = parseTransactionContent(content);

      this.logger.debug(`Parsed action: ${action} from content: ${content}`);

      switch (action) {
        case 'subscribe':
          this.logger.log(`Start processing SUBSCRIBE for job ${job.id}`);
          await this.transactionsService.processSubscribeSePayTransaction(
            job.data,
          );
          this.logger.log(`Finished processing SUBSCRIBE for job ${job.id}`);
          break;
        case 'extend':
          this.logger.log(`Start processing EXTEND for job ${job.id}`);
          await this.transactionsService.processExtendSePayTransaction(
            job.data,
          );
          this.logger.log(`Finished processing EXTEND for job ${job.id}`);
          break;
        case 'upgrade':
          this.logger.log(`Start processing UPGRADE for job ${job.id}`);
          await this.transactionsService.processUpgradeSePayTransaction(
            job.data,
          );
          this.logger.log(`Finished processing UPGRADE for job ${job.id}`);
          break;
        default:
          this.logger.warn(
            `Unknown action: ${action} in job ${job.id} (content: ${content})`,
          );
          throw new Error(`Unknown action: ${action}`);
      }

      this.logger.log(
        `Webhook job ${job.id} (${action}) processed successfully`,
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
