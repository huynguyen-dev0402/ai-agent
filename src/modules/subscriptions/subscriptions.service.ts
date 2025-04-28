import { Subscription } from 'src/modules/subscriptions/entities/subscription.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ResourceType,
  UsageAction,
} from '../usage-logs/entities/usage-log.entity';
import { UsageLogsService } from '../usage-logs/usage-logs.service';
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

  // Hàm mới để lấy số lượng limit còn lại
  async getRemainingLimits(userId: string, startDate: Date, endDate: Date) {
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
      // Thêm các tài nguyên khác nếu cần, ví dụ:
      // { resourceType: ResourceType.MEMBER, limitField: 'member_limit', action: UsageAction.ADD },
    ];

    // Tính số lượng còn lại cho từng tài nguyên
    const remainingLimits = {};
    for (const { resourceType, limitField, action } of resourceLimits) {
      // Lấy tổng limit từ subscription
      const totalLimit = subscription[limitField] || 0;

      // Tính tổng usage đã sử dụng
      const used = await this.usageLogsService.sumUsageByUserId(
        userId,
        resourceType,
        action,
        startDate,
        endDate,
      );

      // Tính số lượng còn lại
      remainingLimits[resourceType] = Math.max(totalLimit - used, 0);
    }

    return remainingLimits;
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

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return `This action updates a #${id} subscription`;
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
