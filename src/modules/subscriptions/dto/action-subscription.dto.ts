// subscription/dto/subscribe.dto.ts
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActionSubscriptionDto {
  @ApiProperty({
    description: 'User UUID',
    example: 'a3f79dce-b88e-4c09-bd0c-30b362c59d15',
  })
  @IsUUID('4', { message: 'userId must be a valid UUID.' })
  @IsNotEmpty({ message: 'userId cannot be empty.' })
  userId: string;

  @ApiPropertyOptional({
    description: 'UUID of the subscription package (optional)',
    example: 'c5dbfda2-61c6-4667-847d-ccf2ed3b25f2',
  })
  @IsUUID('4', { message: 'subscriptionId must be a valid UUID.' })
  @IsOptional()
  subscriptionId?: string;
}
