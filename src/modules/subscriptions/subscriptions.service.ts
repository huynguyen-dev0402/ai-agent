import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from '@modules/subscriptions/dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '@modules/subscriptions/dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResourceType,
  UsageAction,
} from '@modules/usage-logs/entities/usage-log.entity';
import { UsageLogsService } from '@modules/usage-logs/usage-logs.service';
@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly usageLogsService: UsageLogsService,
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
    // Lấy thông tin subscription
    const subscription = await this.findOneByUserId(userId);
    if (!subscription) {
      throw new BadRequestException('Subscription not found');
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
        if (!(limitField in subscription)) {
          throw new Error(`Invalid limit field: ${limitField}`);
        }

        const totalLimit = subscription[limitField] || 0;

        const used = await this.usageLogsService.sumUsageByUserId(
          userId,
          resourceType,
          action,
          subscription.created_at,
          new Date(),
        );

        return [resourceType, Math.max(totalLimit - used, 0)];
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
