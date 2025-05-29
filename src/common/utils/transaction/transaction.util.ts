import { TRANSACTION_CONTENT_REGEX } from '@common/constants/transaction.constant';
import { BadRequestException } from '@nestjs/common';

export function parseTransactionContent(content: string): {
  subscriptionCode: string;
  username: string;
} {
  const match = content.match(TRANSACTION_CONTENT_REGEX);
  if (!match) {
    this.logger.warn(`Invalid transaction content format: ${content}`);
    throw new BadRequestException('Invalid transaction content format');
  }
  this.logger.debug(
    `Parsed transaction content: subscriptionCode=${match[1]}, username=${match[2]}`,
  );
  return { subscriptionCode: match[1], username: match[2] };
}

export function calcEndDate(startDate: Date, durationMonths?: number) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + (durationMonths || 0));
  this.logger.debug(
    `Calculated endDate: ${endDate.toISOString()} from startDate: ${startDate.toISOString()} and durationMonths: ${durationMonths}`,
  );
  return endDate;
}
