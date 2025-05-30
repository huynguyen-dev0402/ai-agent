import { ACTION_MAP, TRANSACTION_CONTENT_REGEX } from '@common/constants/transaction.constant';
import { BadRequestException } from '@nestjs/common';

export function parseTransactionContent(content: string): {
  action: string;
  subscriptionCode: string;
  username: string;
} {
  const match = content.match(TRANSACTION_CONTENT_REGEX);
  if (!match) {
    console.warn(`Invalid transaction content format: ${content}`);
    throw new BadRequestException('Invalid transaction content format');
  }

  const rawAction = match[1]; 
  const subscriptionCode = match[2]; 
  const username = match[3]; 

  const action = ACTION_MAP[rawAction];

  if (!action) {
    console.warn(`Unknown action type: ${rawAction}`);
    throw new BadRequestException('Unknown action type in transaction content');
  }

  console.debug(
    `Parsed transaction content: action=${action}, subscriptionCode=${subscriptionCode}, username=${username}`,
  );

  return {
    action,
    subscriptionCode,
    username,
  };
}

export function calcEndDate(startDate: Date, durationMonths?: number) {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + (durationMonths || 0));
  console.debug(
    `Calculated endDate: ${endDate.toISOString()} from startDate: ${startDate.toISOString()} and durationMonths: ${durationMonths}`,
  );
  return endDate;
}
