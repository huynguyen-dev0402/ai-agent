import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TransactionTemplate {
  COMPACT = 'compact',
  QRONLY = 'qronly',
}

export class GenerateQRDto {
  @ApiProperty({
    description: 'UUID of the subscription package',
    example: 'e61b8ac5-823e-4b7f-9759-5d9de4dc5e55',
  })
  @IsNotEmpty({ message: 'Subscription ID must not be empty.' })
  @IsUUID(4, { message: 'Subscription ID must be a valid UUID (v4).' })
  subscription_id: string;

  @ApiProperty({
    description: 'Id of the user',
    example: 'uuid',
  })
  @IsNotEmpty({ message: 'User ID must not be empty.' })
  @IsUUID(4, { message: 'User ID must be a valid UUID (v4).' })
  user_id: string;

  @ApiProperty({
    description: 'The amount of money to be paid (in VND)',
    example: 99000,
  })
  @IsNotEmpty({ message: 'Amount is required.' })
  @IsNumber({}, { message: 'Amount must be a valid number.' })
  amount: number;

  @ApiProperty({
    description: 'Template style of the QR code',
    enum: TransactionTemplate,
    example: TransactionTemplate.COMPACT,
  })
  @IsNotEmpty({ message: 'Template is required.' })
  @IsEnum(TransactionTemplate, {
    message: `Template must be one of the following: ${Object.values(TransactionTemplate).join(', ')}`,
  })
  template: TransactionTemplate;

  @ApiPropertyOptional({
    description: 'Optional download mode for the QR code',
    example: '1',
  })
  @IsOptional()
  @IsString({ message: 'Download must be a string (if provided).' })
  download?: string;
}
