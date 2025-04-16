import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SEND_MAIL_HOST,
      port: Number(process.env.SEND_MAIL_PORT),
      secure: false,
      service: process.env.SEND_MAIL_SERVICE,
      auth: {
        user: process.env.SEND_MAIL_AUTH_USER,
        pass: process.env.SEND_MAIL_AUTH_PASSWORD,
      },
    });
  }

  async sendMail(to: string, subject: string, text: string): Promise<boolean> {
    const mailOptions = {
      from: process.env.SEND_MAIL_AUTH_USER,
      to,
      subject,
      text,
    };

    try {
      // Send email
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`);
      return false;
    }
  }
}
