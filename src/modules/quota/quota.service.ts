// quota/quota.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
import { SubscriptionStatus } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import {
  ResourceType,
  UsageAction,
  UsageSource,
  UsageStatus,
} from '@modules/usage-logs/entities/usage-log.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';

@Injectable()
export class QuotaService {
  private readonly resourceLimitsMap: Record<ResourceType, keyof Subscription> =
    {
      [ResourceType.MESSAGE]: 'message_limit',
      [ResourceType.KNOWLEDGE]: 'knowledge_limit',
      [ResourceType.AGENT]: 'agent_limit',
      [ResourceType.MEMBER]: 'member_limit',
    };

  constructor(
    private readonly userSubscriptionsService: UserSubscriptionsService,
    private readonly usageLogService: UsageLogsService,
  ) {}

  async checkQuotaAndLog(
    userId: string,
    resourceType: ResourceType,
    action: UsageAction,
    source: UsageSource,
    quantity: number,
    details: Record<string, any> = {},
  ): Promise<string> {
    // 1. Tạo object select động dựa trên resourceType
    const limitField = this.resourceLimitsMap[resourceType];
    if (!limitField) {
      throw new BadRequestException(`Invalid resource type: ${resourceType}`);
    }

    const selectOptions = {
      id: true,
      status: true,
      subscription: {
        [limitField]: true, // Chỉ lấy trường tương ứng với resourceType
      },
    };

    // 2. Kiểm tra subscription với lazy loading động
    const subscription = await this.userSubscriptionsService.findOneForUser(
      userId,
      {
        select: selectOptions,
      },
    );

    if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'User does not have an active subscription',
      );
    }

    // 2. Lấy limit từ subscription
    const limitKey = this.resourceLimitsMap[resourceType];
    if (!limitKey) {
      throw new BadRequestException(`Invalid resource type: ${resourceType}`);
    }

    const limit = subscription.subscription[limitKey] as number;
    if (limit === undefined || limit === null) {
      throw new BadRequestException(
        `Limit not defined for resource type ${resourceType}`,
      );
    }

    // 3. Tính tổng sử dụng
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const usageCount = await this.usageLogService.sumUsageBySubscription(
      subscription.id,
      resourceType,
      action,
      startOfMonth,
      endOfMonth,
    );

    // 4. Kiểm tra quota
    if (usageCount + quantity > limit) {
      throw new BadRequestException(
        `${resourceType} limit exceeded. You have reached the limit of ${limit} for this month.`,
      );
    }

    // 5. Ghi log với trạng thái PENDING (đồng bộ, trả về usageLogId)
    const usageLog = await this.usageLogService.createLogUsagePending(
      userId,
      resourceType,
      action,
      source,
      subscription.id,
      quantity,
      details,
    );

    return usageLog.id;
  }

  async updateLogStatus(logId: string, status: UsageStatus): Promise<void> {
    // Đẩy job update status vào queue (bất đồng bộ)
    await this.usageLogService.updateLogStatusQueue(logId, status);
  }
}
