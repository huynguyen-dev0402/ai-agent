// ... existing code ...
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UsageLogsService } from './usage-logs.service';
import { UsageStatus } from './entities/usage-log.entity';

@Processor('usage-logs')
export class UsageLogsProcessor extends WorkerHost {
  constructor(private readonly usageLogsService: UsageLogsService) {
    super();
  }

  async process(job: Job): Promise<any> {
    switch (job.name) {
      case 'updateLogStatus': {
        const { logId, status } = job.data;
        return this.usageLogsService.updateLogStatus(
          logId,
          status as UsageStatus,
        );
      }
      default:
        throw new Error(`Unknown job name: ${job.name}`);
    }
  }
}
