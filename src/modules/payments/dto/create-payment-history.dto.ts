import { PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentHistoryDto {
  userId: string;
  userSubscriptionId: string;
  amount: number;
  status: PaymentStatus;
  orderId?: string;
  paymentMethod?: string;
  sepayTransactionId?: string;
  description?: string;
  paidAt?: Date;
  rawWebhook?: any;
}
