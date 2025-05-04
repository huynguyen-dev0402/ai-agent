import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDateString } from 'class-validator';
import { ResourceType, UsageAction } from '../entities/usage-log.entity';

export class GetUsageLogsDto {
  @ApiProperty({
    description:
      'Start date of the usage log range in ISO 8601 format (e.g., 2024-01-01)',
    example: '2024-01-01',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description:
      'End date of the usage log range in ISO 8601 format (e.g., 2024-01-31)',
    example: '2024-01-31',
  })
  @IsDateString()
  endDate: string;
}

export class GetUsageSummaryDto extends GetUsageLogsDto {
  @ApiProperty({
    description: 'Type of resource being used (e.g., message, prompt)',
    enum: ResourceType,
    example: ResourceType.MESSAGE,
  })
  @IsEnum(ResourceType)
  resourceType: ResourceType;

  @ApiProperty({
    description: 'Action taken on the resource (e.g., create, update)',
    enum: UsageAction,
    example: UsageAction.SEND,
  })
  @IsEnum(UsageAction)
  action: UsageAction;
}
