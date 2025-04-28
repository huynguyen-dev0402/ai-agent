import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsageLogsService } from './usage-logs.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import {
  UsageLog,
  ResourceType,
  UsageAction,
} from './entities/usage-log.entity';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '../../common/guards/user-id-match.guard';
@Controller('usage-logs')
@UseGuards(AuthGuard, UserIdMatchGuard)
export class UsageLogsController {
  constructor(private readonly usageLogsService: UsageLogsService) {}

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get usage logs for a user' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage logs retrieved successfully.',
    type: [UsageLog],
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUsageLogsForUser(
    @Param('userId') userId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<UsageLog[]> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException(
        'Invalid date format. Dates must be in ISO format.',
      );
    }

    // Normalize startDate: 00:00:00.000
    startDate.setHours(0, 0, 0, 0);

    // Normalize endDate: 23:59:59.999
    endDate.setHours(23, 59, 59, 999);

    // Optionally, ensure startDate <= endDate
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date.');
    }

    return this.usageLogsService.getUsageLogsForUser(
      userId,
      startDate,
      endDate,
    );
  }

  @Get('users/:userId/usage')
  @ApiOperation({
    summary: 'Get usage summary for a user (e.g., total messages sent)',
  })
  @ApiQuery({ name: 'resourceType', required: true, enum: ResourceType })
  @ApiQuery({ name: 'action', required: true, enum: UsageAction })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    description: 'Start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    description: 'End date (ISO format)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage summary retrieved successfully.',
  })
  async getUsageSummary(
    @Param('userId') userId: string,
    @Query('resourceType') resourceType: ResourceType,
    @Query('action') action: UsageAction,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<{ total: number }> {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    // Normalize startDate: 00:00:00.000
    startDate.setHours(0, 0, 0, 0);

    // Normalize endDate: 23:59:59.999
    endDate.setHours(23, 59, 59, 999);

    const total = await this.usageLogsService.sumUsageByUserId(
      userId,
      resourceType,
      action,
      startDate,
      endDate,
    );
    return { total };
  }
}
