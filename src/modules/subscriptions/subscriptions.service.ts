import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '@modules/subscriptions/dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
import { SubscriptionStatus, UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly usageLogsService: UsageLogsService,
    private readonly dataSource: DataSource,
    private readonly logger = new Logger(SubscriptionsService.name),
  ) {}
  async create(createSubscriptionDto: CreateSubscriptionDto) {
    const subscription = this.subscriptionRepository.create(
      createSubscriptionDto,
    );

    await this.subscriptionRepository.save(subscription);
    return subscription;
  }

  async findAll() {
    const subscriptions = await this.subscriptionRepository.find({
      relations: {
        subscription_features: {
          feature: true,
        },
      },
      select: {
        subscription_features: {
          id: true,
          feature: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return subscriptions;
  }

  async getRemainingLimits(userId: string) {
    this.logger.log(`Calculating remaining limits for user: ${userId}`);

    // Lấy thông tin subscription
    const userSub = await this.dataSource
      .getRepository(UserSubscriptions)
      .createQueryBuilder('us')
      .leftJoinAndSelect('us.subscription', 'subscription')
      .where('us.user_id = :userId', { userId })
      .andWhere('us.status = :status', { status: SubscriptionStatus.ACTIVE })
      .orderBy('us.end_date', 'DESC')
      .getOne();

    if (!userSub) {
      this.logger.warn(`No active user subscription found for user: ${userId}`);
      throw new BadRequestException('Active subscription not found');
    }
    if (!userSub.subscription) {
      this.logger.error(`User subscription found but missing subscription entity for user: ${userId}`);
      throw new BadRequestException('Subscription entity not found for active user subscription');
    }

    // Định nghĩa các loại tài nguyên cần kiểm tra
    const resourceLimits = [
      {
        resourceType: ResourceType.MESSAGE,
        limitField: 'message_limit',
        action: UsageAction.SEND,
      },
      {
        resourceType: ResourceType.KNOWLEDGE,
        limitField: 'knowledge_limit',
        action: UsageAction.CREATE,
      },
      {
        resourceType: ResourceType.AGENT,
        limitField: 'agent_limit',
        action: UsageAction.CREATE,
      },
      {
        resourceType: ResourceType.MEMBER,
        limitField: 'member_limit',
        action: UsageAction.CREATE,
      },
    ];

    // Tính toán số lượng còn lại đồng thời cho các loại tài nguyên
    const remainingEntries = await Promise.all(
      resourceLimits.map(async ({ resourceType, limitField, action }) => {
        try {
          const totalLimit = userSub.subscription[limitField] || 0;

          const used = await this.usageLogsService.sumUsageBySubscription(
            userSub.id,
            resourceType,
            action,
            userSub.start_date,
            userSub.end_date || new Date(),
          );

          this.logger.log(
            `User ${userId} - ${resourceType}: totalLimit=${totalLimit}, used=${used}, remaining=${Math.max(totalLimit - used, 0)}`
          );

          return [resourceType, Math.max(totalLimit - used, 0)];
        } catch (error) {
          this.logger.error(
            `Error calculating limit for user ${userId}, resource ${resourceType}: ${error.message}`,
            error.stack,
          );
          // Nếu lỗi, trả về 0 cho resource đó
          return [resourceType, 0];
        }
      }),
    );

    return Object.fromEntries(remainingEntries);
  }

  async findOneByUserId(userId: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        user_subscriptions: {
          user: {
            id: userId,
          },
          status: SubscriptionStatus.ACTIVE,
        },
      },
    });
    return subscription;
  }

  async findOne(id: string) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        id,
      },
    });
    return subscription;
  }

  async findOneByCode(code: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: {
        subscription_code: code,
      },
    });
    return subscription;
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
