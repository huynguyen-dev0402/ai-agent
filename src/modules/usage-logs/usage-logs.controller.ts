import {
  Controller,
  Get,
  Param,
  Query,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsageLog } from '@modules/usage-logs/entities/usage-log.entity';
import { AuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserIdMatchGuard } from '@common/guards/user-id-match.guard';
import { GetUsageLogsDto, GetUsageSummaryDto } from '@modules/usage-logs/dto/get-usage-logs.dto';

@ApiTags('Usage Logs')
@Controller('usage-logs')
@UseGuards(AuthGuard, UserIdMatchGuard)
export class UsageLogsController {
  constructor(private readonly usageLogsService: UsageLogsService) {}

  @Get('users/:userId')
  @ApiOperation({
    summary: 'Retrieve usage logs by user ID',
    description:
      'Fetches all usage logs of a user within the specified date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the usage logs.',
    type: [UsageLog],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid date format or startDate is after endDate.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async getUsageLogsForUser(
    @Param('userId') userId: string,
    @Query() query: GetUsageLogsDto,
  ): Promise<UsageLog[]> {
    const { startDate, endDate } = query;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date.');
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return this.usageLogsService.getUsageLogsForUser(userId, start, end);
  }

  @Get('users/:userId/usage')
  @ApiOperation({
    summary: 'Get usage summary by user ID',
    description:
      'Returns the total number of actions performed by the user on a specific resource type within the given date range.',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the usage summary.',
    schema: {
      example: {
        total: 123,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters or startDate is after endDate.',
  })
  @ApiOperation({
    summary: 'Get usage summary for a user (e.g., total messages sent)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage summary retrieved successfully.',
  })
  async getUsageSummary(
    @Param('userId') userId: string,
    @Query() query: GetUsageSummaryDto,
  ): Promise<{ total: number }> {
    const { resourceType, action, startDate, endDate } = query;

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      throw new BadRequestException('Start date must be before end date.');
    }

    const total = await this.usageLogsService.sumUsageByUserId(
      userId,
      resourceType,
      action,
      start,
      end,
    );
    return { total };
  }
}
