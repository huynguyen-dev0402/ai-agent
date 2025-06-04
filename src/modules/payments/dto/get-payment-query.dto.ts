import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsIn } from 'class-validator';

export const DEFAULT_PAYMENT_LIMIT = 10;
export const DEFAULT_PAYMENT_OFFSET = 0;
export const DEFAULT_PAYMENT_SORT = 'created_at';

export enum PaymentOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const DEFAULT_PAYMENT_ORDER = PaymentOrder.DESC;

export class GetPaymentsQueryDto {
  @ApiPropertyOptional()
  @IsString()
  userId: string;

  @ApiPropertyOptional({ default: DEFAULT_PAYMENT_LIMIT })
  @IsOptional()
  @IsNumber()
  limit?: number = DEFAULT_PAYMENT_LIMIT;

  @ApiPropertyOptional({ default: DEFAULT_PAYMENT_OFFSET })
  @IsOptional()
  @IsNumber()
  offset?: number = DEFAULT_PAYMENT_OFFSET;

  @ApiPropertyOptional({ default: DEFAULT_PAYMENT_SORT })
  @IsOptional()
  @IsString()
  sort?: string = DEFAULT_PAYMENT_SORT;

  @ApiPropertyOptional({ default: DEFAULT_PAYMENT_ORDER, enum: PaymentOrder })
  @IsOptional()
  @IsIn([PaymentOrder.ASC, PaymentOrder.DESC])
  order?: PaymentOrder = DEFAULT_PAYMENT_ORDER;
}
