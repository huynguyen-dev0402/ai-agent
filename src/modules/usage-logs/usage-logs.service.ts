import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ResourceType,
  UsageAction,
  UsageLog,
  UsageSource,
  UsageStatus,
} from './entities/usage-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class UsageLogsService {
  constructor(
    @InjectRepository(UsageLog)
    private readonly usageLogRepository: Repository<UsageLog>,
    @InjectQueue('usage-logs') private readonly usageLogsQueue: Queue,
  ) {}

  async createLogUsage(
    userId: string,
    resourceType: ResourceType,
    action: UsageAction,
    source: UsageSource,
    userSubscriptionId?: string,
    quantity?: number,
    details?: Record<string, any>,
  ): Promise<UsageLog> {
    if (quantity && quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const log = this.usageLogRepository.create({
      user: { id: userId },
      user_subscriptions: { id: userSubscriptionId },
      resource_type: resourceType,
      action,
      quantity,
      details,
      source,
      status: UsageStatus.ACTIVE,
      used_at: new Date(),
    });

    return this.usageLogRepository.save(log);
  }

  async createLogUsagePendingQueue(
    userId: string,
    resourceType: ResourceType,
    action: UsageAction,
    source: UsageSource,
    userSubscriptionId?: string,
    quantity?: number,
    details?: Record<string, any>,
  ) {
    await this.usageLogsQueue.add('createLogUsagePending', {
      userId,
      resourceType,
      action,
      source,
      userSubscriptionId,
      quantity,
      details,
    });
  }

  async updateLogStatusQueue(logId: string, status: UsageStatus) {
    await this.usageLogsQueue.add('updateLogStatus', { logId, status });
  }

  // Thêm hàm logUsagePending
  async createLogUsagePending(
    userId: string,
    resourceType: ResourceType,
    action: UsageAction,
    source: UsageSource,
    userSubscriptionId?: string,
    quantity?: number,
    details?: Record<string, any>,
  ): Promise<UsageLog> {
    if (quantity && quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const log = this.usageLogRepository.create({
      user: { id: userId },
      user_subscriptions: { id: userSubscriptionId },
      resource_type: resourceType,
      action,
      quantity,
      details,
      source,
      status: UsageStatus.PENDING, // Trạng thái ban đầu là PENDING
      used_at: new Date(),
    });

    return this.usageLogRepository.save(log);
  }

  // updateLogStatus
  async updateLogStatus(logId: string, status: UsageStatus): Promise<UsageLog> {
    const log = await this.usageLogRepository.findOne({ where: { id: logId } });
    if (!log) {
      throw new BadRequestException('Usage log not found');
    }
    if (log.status === status) {
      throw new BadRequestException(`Usage log already in ${status} status`);
    }

    log.status = status;
    return this.usageLogRepository.save(log);
  }

  async getUsageLogsForUser(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<UsageLog[]> {
    return this.usageLogRepository.find({
      where: {
        user: { id: userId },
        used_at: Between(startDate, endDate),
        status: UsageStatus.ACTIVE,
      },
      order: { used_at: 'DESC' },
    });
  }

  // async countUsage(
  //   userId: string,
  //   resourceType: ResourceType,
  //   action: UsageAction,
  //   startDate: Date,
  //   endDate: Date,
  // ): Promise<number> {
  //   return this.usageLogRepository.count({
  //     where: {
  //       user: { id: userId },
  //       resource_type: resourceType,
  //       action,
  //       used_at: Between(startDate, endDate),
  //       status: UsageStatus.ACTIVE,
  //     },
  //   });
  // }

  //Hàm tính tổng số lượng user đã dùng trong 1 khoảng thời gian cho 1 loại tài nguyên và action cụ thể
  async sumUsageByUserId(
    userId: string,
    resourceType: ResourceType,
    action: UsageAction,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.usageLogRepository
      .createQueryBuilder('usage_logs')
      .select('SUM(usage_logs.quantity)', 'total')
      .where('usage_logs.user_id = :userId', { userId })
      .andWhere('usage_logs.resource_type = :resourceType', { resourceType })
      .andWhere('usage_logs.action = :action', { action })
      .andWhere('usage_logs.used_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('usage_logs.status = :status', { status: UsageStatus.ACTIVE })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }

  // Thêm hàm để tính tổng sử dụng cho tất cả actions của một loại tài nguyên (vd: knowledge, member, message,...)
  // async sumUsageByResourceType(
  //   userSubscriptionId: string,
  //   resourceType: ResourceType,
  //   startDate: Date,
  //   endDate: Date,
  // ): Promise<number> {
  //   const result = await this.usageLogRepository
  //     .createQueryBuilder('usage_logs')
  //     .select('SUM(usage_logs.quantity)', 'total')
  //     .where('usage_logs.user_subscription_id = :userSubscriptionId', {
  //       userSubscriptionId,
  //     })
  //     .andWhere('usage_logs.resource_type = :resourceType', { resourceType })
  //     .andWhere('usage_logs.used_at BETWEEN :startDate AND :endDate', {
  //       startDate,
  //       endDate,
  //     })
  //     .andWhere('usage_logs.status = :status', { status: UsageStatus.ACTIVE })
  //     .getRawOne();

  //   return parseFloat(result.total) || 0;
  // }

  async sumUsageBySubscription(
    userSubscriptionId: string,
    resourceType: ResourceType,
    action: UsageAction,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const result = await this.usageLogRepository
      .createQueryBuilder('usage_logs')
      .select('SUM(usage_logs.quantity)', 'total')
      .where('usage_logs.user_subscription_id = :userSubscriptionId', {
        userSubscriptionId,
      })
      .andWhere('usage_logs.resource_type = :resourceType', { resourceType })
      .andWhere('usage_logs.action = :action', { action })
      .andWhere('usage_logs.used_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('usage_logs.status = :status', { status: UsageStatus.ACTIVE })
      .getRawOne();

    return parseFloat(result.total) || 0;
  }
}
