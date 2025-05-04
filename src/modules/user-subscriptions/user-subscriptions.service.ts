import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserSubscriptions,
  SubscriptionStatus,
} from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UsersService } from '@modules/users/users.service';
import { UserStatus } from '@modules/users/entities/user.entity';

@Injectable()
export class UserSubscriptionsService {
  private readonly logger = new Logger(UserSubscriptionsService.name);

  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UsersService,
  ) {}

  async subscribe(userId: string, subscriptionId: string): Promise<boolean> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return await this.userSubRepository.manager.transaction(async (manager) => {
      const subscription = await manager.findOne(Subscription, {
        where: { id: subscriptionId },
      });

      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      const userSubscriptions = await manager.find(UserSubscriptions, {
        where: { user: { id: userId } },
      });

      const activeSubscription = userSubscriptions.find(
        (s) => s.status === SubscriptionStatus.ACTIVE,
      );

      const expiredSubscription = userSubscriptions.find(
        (s) => s.status === SubscriptionStatus.EXPIRED,
      );

      // Đã có gói active
      if (activeSubscription) {
        throw new BadRequestException(
          'You are currently on a different plan. Please cancel before subscribing to a new plan.',
        );
      }

      // Nếu gói miễn phí và đã dùng rồi
      if (
        subscription.price === 0 &&
        expiredSubscription &&
        expiredSubscription.subscription.id === subscription.id
      ) {
        throw new BadRequestException(
          'You have already used this free plan. You cannot re-subscribe.',
        );
      }

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + subscription.duration_months);

      const userSubscription = manager.create(UserSubscriptions, {
        user: { id: user.id },
        subscription: { id: subscription.id },
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
      });

      await manager.save(userSubscription);

      return true;
    });
  }

  async upgradeSubscription(
    userId: string,
    newSubscriptionId: string,
  ): Promise<boolean> {
    return this.userSubRepository.manager.transaction(async (manager) => {
      this.logger.log(
        `Upgrading subscription for user ${userId} to ${newSubscriptionId}`,
      );

      const [user, newSubscription] = await Promise.all([
        this.userService.findOne(userId),
        manager.findOne(Subscription, {
          where: { id: newSubscriptionId },
          cache: true,
        }),
      ]);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new BadRequestException(
          'User is inactive and cannot upgrade subscription.',
        );
      }

      if (!newSubscription) {
        throw new NotFoundException('New subscription not found');
      }

      if (newSubscription.duration_months <= 0) {
        throw new BadRequestException(
          'New subscription duration must be greater than 0.',
        );
      }

      const currentSubscription = await manager.findOne(UserSubscriptions, {
        where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
        relations: ['subscription'],
      });

      if (!currentSubscription) {
        throw new BadRequestException(
          'User does not have an active subscription to upgrade',
        );
      }

      if (currentSubscription.subscription.id === newSubscriptionId) {
        throw new BadRequestException(
          'New subscription is the same as the current one',
        );
      }

      // Hủy gói hiện tại
      currentSubscription.status = SubscriptionStatus.CANCELED;
      await manager.save(currentSubscription);

      // Tạo gói mới
      const startDate = new Date();
      const endDate = this.addMonthsManually(
        startDate,
        newSubscription.duration_months,
      );

      const newUserSubscription = manager.create(UserSubscriptions, {
        user: { id: user.id },
        subscription: { id: newSubscriptionId },
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
      });

      await manager.save(newUserSubscription);
      return true;
    });
  }

  async extendSubscription(userId: string): Promise<UserSubscriptions> {
    this.logger.log(`Extending subscription for user ${userId}`);

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException(
        'User is inactive and cannot extend subscription.',
      );
    }

    const currentSubscription = await this.userSubRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      relations: ['subscription'],
    });

    if (!currentSubscription) {
      throw new BadRequestException(
        'User does not have an active subscription to extend',
      );
    }

    const subscription = currentSubscription.subscription;
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.duration_months <= 0) {
      throw new BadRequestException(
        'Subscription duration must be greater than 0.',
      );
    }

    const newEndDate = this.addMonthsManually(
      currentSubscription.end_date,
      subscription.duration_months,
    );
    currentSubscription.end_date = newEndDate;

    return this.userSubRepository.save(currentSubscription);
  }

  async renewSubscription(userId: string): Promise<boolean> {
    return this.userSubRepository.manager.transaction(async (manager) => {
      this.logger.log(`Renewing subscription for user ${userId}`);

      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new BadRequestException(
          'User is inactive and cannot renew subscription.',
        );
      }

      const expiredSubscription = await manager.findOne(UserSubscriptions, {
        where: {
          user: { id: userId },
          status: SubscriptionStatus.EXPIRED,
        },
        relations: ['subscription'],
        cache: true,
      });

      if (!expiredSubscription) {
        throw new BadRequestException(
          'User does not have an expired subscription to renew. Use subscribe to start a new subscription.',
        );
      }

      const subscription = expiredSubscription.subscription;
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      if (subscription.duration_months <= 0) {
        throw new BadRequestException(
          'Subscription duration must be greater than 0.',
        );
      }

      // Cập nhật trạng thái gói cũ
      expiredSubscription.status = SubscriptionStatus.CANCELED;
      await manager.save(expiredSubscription);

      const startDate = new Date();
      const endDate = this.addMonthsManually(
        startDate,
        subscription.duration_months,
      );

      const newUserSubscription = manager.create(UserSubscriptions, {
        user: { id: userId },
        subscription: { id: subscription.id },
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
      });

      await manager.save(newUserSubscription);
      return true;
    });
  }

  async cancelSubscription(userId: string): Promise<boolean> {
    this.logger.log(`Canceling subscription for user ${userId}`);

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException(
        'User is inactive and cannot cancel subscription.',
      );
    }

    const currentSubscription = await this.userSubRepository.findOne({
      where: {
        user: { id: userId },
        status: SubscriptionStatus.ACTIVE,
      },
      select: ['id'], // giảm payload nếu không cần thông tin khác
    });

    if (!currentSubscription) {
      throw new BadRequestException(
        'User does not have an active subscription to cancel',
      );
    }

    await this.userSubRepository.update(currentSubscription.id, {
      status: SubscriptionStatus.CANCELED,
    });

    return true;
  }

  async findOneForUser(
    userId: string,
    options: {
      select?: {
        id?: boolean;
        status?: boolean;
        subscription?: {
          name?: boolean;
          duration_months?: boolean;
          message_limit?: boolean;
          knowledge_limit?: boolean;
          agent_limit?: boolean;
          member_limit?: boolean;
        };
      };
    } = {},
  ): Promise<UserSubscriptions | null> {
    // Mặc định select các trường cần thiết nếu không truyền options
    const defaultSelect = {
      id: true,
      status: true,
      subscription: {
        name: true,
        message_limit: true,
        knowledge_limit: true,
        agent_limit: true,
        member_limit: true,
        duration_months: true,
      },
      ...options.select,
    };

    // Truy vấn với select tối ưu
    let subscription = await this.userSubRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      relations: { subscription: true },
      select: defaultSelect,
    });

    // Nếu không tìm thấy subscription ACTIVE, tìm subscription EXPIRED
    if (!subscription) {
      subscription = await this.userSubRepository.findOne({
        where: { user: { id: userId }, status: SubscriptionStatus.EXPIRED },
        relations: { subscription: true },
        select: defaultSelect,
      });
    }

    return subscription;
  }

  addMonthsManually(date: Date, months: number): Date {
    const newDate = new Date(date);
    const day = newDate.getDate();
    newDate.setMonth(newDate.getMonth() + months);
    if (newDate.getDate() !== day) {
      newDate.setDate(0);
    }
    return newDate;
  }
}
