import { SetMetadata } from '@nestjs/common';
import {
  ResourceType,
  UsageAction,
} from 'src/modules/usage-logs/entities/usage-log.entity';

export const CHECK_QUOTA_KEY = 'check_quota';

export interface CheckQuotaOptions {
  resourceType: ResourceType;
  action: UsageAction;
  quantity?: number; // mặc định 1
}

export const CheckQuota = (options: CheckQuotaOptions) =>
  SetMetadata(CHECK_QUOTA_KEY, options);
