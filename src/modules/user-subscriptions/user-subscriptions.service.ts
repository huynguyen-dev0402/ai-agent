import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Between, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  UserSubscriptions,
  SubscriptionStatus,
} from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { Subscription } from '@modules/subscriptions/entities/subscription.entity';
import { UsersService } from '@modules/users/users.service';
import { UserStatus } from '@modules/users/entities/user.entity';
import { PaymentsService } from '@modules/payments/payments.service';
import { TransactionsService } from '@modules/transactions/transactions.service';
import {
  ActionTemplate,
  TransactionTemplate,
} from '@modules/transactions/dto/generate-qr.dto';
import {
  Chatbot,
  ChatbotStatus,
} from '@modules/chatbots/entities/chatbot.entity';

@Injectable()
export class UserSubscriptionsService {
  private readonly logger = new Logger(UserSubscriptionsService.name);

  constructor(
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
    @InjectRepository(Chatbot)
    private readonly chatbotRepository: Repository<Chatbot>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    private readonly userService: UsersService,
    private readonly paymentsService: PaymentsService,
    private readonly transactionService: TransactionsService,
  ) {}

  async subscribe(userId: string, subscriptionId: string) {
    this.logger.log(
      `Initiating subscription for user ${userId} with subscription ${subscriptionId}`,
    );
    const [user, subscription, userSubscriptions] = await Promise.all([
      this.userService.findOne(userId),
      this.subscriptionRepository.findOne({
        where: { id: subscriptionId },
      }),
      this.userSubRepository.find({
        where: {
          user: { id: userId },
          status: In([SubscriptionStatus.ACTIVE, SubscriptionStatus.EXPIRED]),
        },
        relations: ['subscription'], // Eager loading để lấy thông tin subscription
      }),
    ]);

    // Kiểm tra lỗi
    if (!user) throw new NotFoundException('User not found.');
    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestException('User is inactive and cannot subscribe.');
    }
    if (!subscription) throw new NotFoundException('Subscription not found');

    // Kiểm tra active và expired subscription trực tiếp từ dữ liệu
    const activeSubscription = userSubscriptions.find(
      (s) => s.status === SubscriptionStatus.ACTIVE,
    );
    const expiredFreeSubscription = userSubscriptions.find(
      (s) =>
        s.status === SubscriptionStatus.EXPIRED &&
        s.subscription.id === subscriptionId &&
        s.subscription.price === 0,
    );

    if (activeSubscription) {
      throw new BadRequestException(
        'You are currently on a different plan. Please cancel before subscribing to a new plan.',
      );
    }
    if (subscription.price === 0 && expiredFreeSubscription) {
      throw new BadRequestException(
        'You have already used this free plan. You cannot re-subscribe.',
      );
    }
    const startDate = new Date();
    const endDate = this.addMonthsManually(
      startDate,
      subscription.duration_months,
    );
    const isFree = subscription.price === 0;
    return this.userSubRepository.manager.transaction(async (manager) => {
      const userSubscription = manager.create(UserSubscriptions, {
        user: { id: userId },
        subscription: { id: subscription.id },
        start_date: startDate,
        end_date: endDate,
        status: isFree ? SubscriptionStatus.ACTIVE : SubscriptionStatus.PENDING,
        amount: subscription.price,
        ...(isFree
          ? {}
          : {
              order_id: `SEVQR${ActionTemplate.SUBSCRIBE}${subscription.subscription_code}${user.username}TS${Date.now()}`,
            }),
      });

      await manager.save(userSubscription);

      if (isFree) {
        return {
          paymentUrl: null,
          userSubscriptionId: userSubscription.id,
          orderId: null,
        };
      }

      const { qrImageUrl } = await this.transactionService.generateQR({
        username: user.username,
        action: ActionTemplate.SUBSCRIBE,
        order_id: userSubscription.order_id,
        subscription_code: subscription.subscription_code,
        amount: userSubscription.amount,
        template: TransactionTemplate.COMPACT,
      });

      return {
        paymentUrl: qrImageUrl,
        userSubscriptionId: userSubscription.id,
        orderId: userSubscription.order_id,
      };
    });
  }

  async upgradeSubscription(userId: string, newSubscriptionId: string) {
    return this.userSubRepository.manager.transaction(async (manager) => {
      this.logger.log(
        `Upgrading subscription for user ${userId} to ${newSubscriptionId}`,
      );

      const newSubscription = await manager.findOne(Subscription, {
        where: { id: newSubscriptionId },
        cache: true,
      });

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
        relations: ['subscription', 'user'],
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

      // Tạo gói mới với trạng thái pending
      const startDate = new Date();
      const endDate = this.addMonthsManually(
        startDate,
        newSubscription.duration_months,
      );

      const newUserSubscription = manager.create(UserSubscriptions, {
        user: { id: userId },
        subscription: { id: newSubscriptionId },
        amount: newSubscription.price,
        order_id: `SEVQR${ActionTemplate.UPGRADE}${newSubscription.subscription_code}${currentSubscription.user.username}TS${Date.now()}`,
        end_date: endDate,
        start_date: startDate,
        status: SubscriptionStatus.PENDING,
      });

      await manager.save(newUserSubscription);

      // Generate QR code for payment
      const { qrImageUrl } = await this.transactionService.generateQR({
        username: currentSubscription.user.username,
        action: ActionTemplate.UPGRADE,
        order_id: newUserSubscription.order_id,
        subscription_code: newSubscription.subscription_code,
        amount: newSubscription.price,
        template: TransactionTemplate.COMPACT,
      });

      // Return only necessary response data
      return {
        paymentUrl: qrImageUrl,
        userSubscriptionId: newUserSubscription.id,
        orderId: newUserSubscription.order_id,
      };
    });
  }

  async extendSubscription(userId: string) {
    this.logger.log(`Extending subscription for user ${userId}`);

    // Fetch active subscription with relations in one query
    const currentSubscription = await this.userSubRepository.findOne({
      where: { user: { id: userId }, status: SubscriptionStatus.ACTIVE },
      relations: ['subscription', 'user'],
    });

    // Validate subscription existence and properties
    if (!currentSubscription) {
      throw new BadRequestException('No active subscription found for user');
    }

    const { subscription, user } = currentSubscription;
    if (!subscription) {
      throw new NotFoundException('Subscription details not found');
    }

    if (subscription.duration_months <= 0) {
      throw new BadRequestException('Invalid subscription duration');
    }

    // Update subscription details
    const updatedSubscription = {
      ...currentSubscription,
      amount: subscription.price,
      order_id: `SEVQR${ActionTemplate.EXTEND}${subscription.subscription_code}${user.username}TS${Date.now()}`,
    };

    // Save updated subscription
    const savedSubscription =
      await this.userSubRepository.save(updatedSubscription);

    // Generate QR code for payment
    const { qrImageUrl } = await this.transactionService.generateQR({
      username: user.username,
      action: ActionTemplate.EXTEND,
      order_id: savedSubscription.order_id,
      subscription_code: subscription.subscription_code,
      amount: savedSubscription.amount,
      template: TransactionTemplate.COMPACT,
    });

    // Return only necessary response data
    return {
      paymentUrl: qrImageUrl,
      userSubscriptionId: savedSubscription.id,
      orderId: savedSubscription.order_id,
    };
  }

  async renewSubscription(userId: string): Promise<boolean> {
    return this.userSubRepository.manager.transaction(async (manager) => {
      this.logger.log(`Renewing subscription for user ${userId}`);

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

  async cancelSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<boolean> {
    this.logger.log(`Canceling subscription for user ${userId}`);

    return this.userSubRepository.manager.transaction(async (manager) => {
      // Tìm gói đăng ký đang hoạt động
      const currentSubscription = await manager.findOne(UserSubscriptions, {
        where: {
          user: { id: userId },
          subscription: { id: subscriptionId },
          status: SubscriptionStatus.ACTIVE,
        },
        select: ['id'],
      });

      if (!currentSubscription) {
        throw new BadRequestException(
          'User does not have an active subscription to cancel',
        );
      }

      // Tìm tất cả chatbot được tạo trong khoảng thời gian start_date -> end_date
      const chatbots = await manager.find(Chatbot, {
        where: {
          user: { id: userId },
          user_subscriptions_id: currentSubscription.id,
        },
        select: ['id'],
      });

      // Cập nhật trạng thái gói đăng ký thành CANCELED
      await manager.update(
        UserSubscriptions,
        { id: currentSubscription.id },
        { status: SubscriptionStatus.CANCELED },
      );

      // Cập nhật trạng thái của tất cả chatbot thành inactive
      if (chatbots.length > 0) {
        await manager.update(
          Chatbot,
          { id: In(chatbots.map((chatbot) => chatbot.id)) },
          { status: ChatbotStatus.INACTIVE },
        );
      }

      return true;
    });
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
      start_date: true,
      end_date: true,
      subscription: {
        id: true,
        name: true,
        price: true,
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

  async findUserSubPendingForUser(
    userId: string,
    subscriptionId: string,
  ): Promise<UserSubscriptions | null> {
    // Truy vấn với select tối ưu
    let subscription = await this.userSubRepository.findOne({
      where: {
        user: { id: userId },
        subscription: { id: subscriptionId },
        status: SubscriptionStatus.PENDING,
      },
    });

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
