import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './email.service';

@Processor('mail')
export class MailProcessor extends WorkerHost {
  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job): Promise<any> {
    const { to, subject, otp } = job.data;
    return await this.mailService.sendMail(to, subject, `Mã OTP của bạn là: ${otp}`);
  }
}
