import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { TokenStatus } from '../entities/api-token.entity';

export class CreateApiTokenDto {
  @ApiProperty({
    example: 'Production API Token',
    description: 'Name of the API token',
  })
  @IsString({ message: 'Token name must be a string' })
  @IsNotEmpty({ message: 'Token name cannot be empty' })
  token_name: string;

  @ApiProperty({
    example: 'API token for production environment access',
    description: 'Description of the API token',
    required: false,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: TokenStatus.ACTIVE,
    description: 'Status of the API token',
    enum: TokenStatus,
    default: TokenStatus.ACTIVE,
  })
  @IsEnum(TokenStatus, { message: 'Status must be either active or inactive' })
  @IsOptional()
  status?: TokenStatus = TokenStatus.ACTIVE;

  @ApiProperty({
    example: '2025-12-31T23:59:59.000Z',
    description: 'Expiration date of the API token',
  })
  @IsDateString({}, { message: 'Expires at must be a valid date' })
  expires_at: string;
}
