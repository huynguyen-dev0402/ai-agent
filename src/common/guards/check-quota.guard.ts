// import {
//   CanActivate,
//   ExecutionContext,
//   Injectable,
//   BadRequestException,
// } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import { UserSubscriptionsService } from '@modules/user-subscriptions/user-subscriptions.service';
// import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
// import {
//   CHECK_QUOTA_KEY,
//   CheckQuotaOptions,
// } from '@common/decorators/check-quota.decorator';
// import {
//   ResourceType,
//   UsageSource,
// } from '@modules/usage-logs/entities/usage-log.entity';
// import { SubscriptionStatus } from '@modules/user-subscriptions/entities/user-subscriptions.entity';

// @Injectable()
// export class CheckQuotaGuard implements CanActivate {
//   constructor(
//     private readonly reflector: Reflector,
//     private readonly userSubscriptionsService: UserSubscriptionsService,
//     private readonly usageLogService: UsageLogsService,
//   ) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const request = context.switchToHttp().getRequest();
//     const response = context.switchToHttp().getResponse();
//     const user = request.user;

//     if (!user?.id) {
//       throw new BadRequestException('User ID not found in request');
//     }

//     if (user.role === 'super_admin') {
//       return true;
//     }

//     const handler = context.getHandler();
//     const options: CheckQuotaOptions = this.reflector.get(
//       CHECK_QUOTA_KEY,
//       handler,
//     );

//     if (!options) {
//       return true;
//     }

//     const { resourceType, action, quantity = 1 } = options;
//     const source = UsageSource.API;

//     const subscription = await this.userSubscriptionsService.findOneForUser(
//       user.id,
//     );
//     if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) {
//       throw new BadRequestException(
//         'User does not have an active subscription',
//       );
//     }

//     let limit: number;
//     switch (resourceType) {
//       case ResourceType.MESSAGE:
//         limit = subscription.subscription.message_limit;
//         break;
//       case ResourceType.KNOWLEDGE:
//         limit = subscription.subscription.knowledge_limit;
//         break;
//       case ResourceType.AGENT:
//         limit = subscription.subscription.agent_limit;
//         break;
//       case ResourceType.MEMBER:
//         limit = subscription.subscription.member_limit;
//         break;
//       default:
//         throw new BadRequestException('Invalid resource type');
//     }

//     if (!limit) {
//       throw new BadRequestException(
//         `Limit not defined for resource type ${resourceType}`,
//       );
//     }

//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const endOfMonth = new Date(startOfMonth);
//     endOfMonth.setMonth(endOfMonth.getMonth() + 1);

//     const usageCount = await this.usageLogService.sumUsageBySubscription(
//       subscription.id,
//       resourceType,
//       action,
//       startOfMonth,
//       endOfMonth,
//     );

//     if (usageCount >= limit) {
//       throw new BadRequestException(
//         `${resourceType} limit exceeded. You have reached the limit of ${limit} for this month.`,
//       );
//     }

//     const usageLog = await this.usageLogService.createLogUsagePending(
//       user.id,
//       resourceType,
//       action,
//       source,
//       subscription.id,
//       quantity,
//       {},
//     );

//     response.locals.usageLogData = {
//       usageLogId: usageLog.id,
//     };

//     return true;
//   }
// }
