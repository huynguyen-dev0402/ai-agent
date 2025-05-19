import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TransferType {
  IN = 'in',
  OUT = 'out',
}

export class SePayWebhookDto {
  @ApiProperty({ description: 'Transaction ID on SePay', example: 92704 })
  @IsNumber({}, { message: 'Transaction ID must be a valid number.' })
  id: number;

  @ApiProperty({ description: 'Bank brand name', example: 'Vietcombank' })
  @IsString({ message: 'Gateway must be a string.' })
  gateway: string;

  @ApiProperty({
    description: 'Transaction date and time',
    example: '2024-07-25 14:02:37',
  })
  @IsDateString(
    {},
    { message: 'Transaction date must be a valid ISO 8601 date string.' },
  )
  transactionDate: string;

  @ApiProperty({ description: 'Bank account number', example: '0123499999' })
  @IsString({ message: 'Account number must be a string.' })
  accountNumber: string;

  @ApiProperty({
    description: 'Payment code (can be null)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Code must be a string if provided.' })
  code?: string | null;

  @ApiProperty({
    description: 'Transaction content',
    example: 'chuyen tien mua iphone',
  })
  @IsString({ message: 'Content must be a string.' })
  content: string;

  @ApiProperty({
    description: 'Transaction type',
    enum: TransferType,
    example: 'in',
  })
  @IsEnum(TransferType, {
    message: `Transfer type must be one of the following values: ${Object.values(TransferType).join(', ')}`,
  })
  transferType: TransferType;

  @ApiProperty({ description: 'Transaction amount', example: 2277000 })
  @IsNumber({}, { message: 'Transfer amount must be a valid number.' })
  transferAmount: number;

  @ApiProperty({
    description: 'Accumulated account balance',
    example: 19077000,
  })
  @IsNumber({}, { message: 'Accumulated balance must be a valid number.' })
  accumulated: number;

  @ApiProperty({
    description: 'Sub-account (can be null)',
    example: null,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Sub account must be a string if provided.' })
  subAccount?: string | null;

  @ApiProperty({ description: 'Reference code', example: 'MBVCB.3278907687' })
  @IsString({ message: 'Reference code must be a string.' })
  referenceCode: string;

  @ApiProperty({
    description: 'Full bank notification content (can be empty)',
    example: '',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string if provided.' })
  description?: string;
}
