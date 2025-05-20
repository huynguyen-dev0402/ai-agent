import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GenerateQRDto } from './dto/generate-qr.dto';
import { SePayWebhookDto } from './dto/webhook.dto';
import { SubscriptionsService } from '@modules/subscriptions/subscriptions.service';
import {
  SubscriptionStatus,
  UserSubscriptions,
} from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly subscriptionService: SubscriptionsService,
    @InjectRepository(UserSubscriptions)
    private readonly userSubRepository: Repository<UserSubscriptions>,
  ) {}

  async generateQR(
    generateQrDto: GenerateQRDto,
  ): Promise<{ qrImageUrl: string }> {
    const acc = this.configService.get<string>('ACCOUNT');
    const bank = this.configService.get<string>('BANK');

    // Kiểm tra ENV
    if (!acc) {
      throw new InternalServerErrorException(
        'Environment variable ACCOUNT is not set.',
      );
    }
    if (!bank) {
      throw new InternalServerErrorException(
        'Environment variable BANK is not set.',
      );
    }

    // Validate dữ liệu nghiệp vụ nếu cần
    if (generateQrDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero.');
    }

    const subsription = await this.subscriptionService.findOne(
      generateQrDto.subscription_id,
    );
    if (!subsription) {
      throw new NotFoundException('Subscription not found');
    }

    const userSub = await this.userSubRepository.findOne({
      where: {
        user: { id: generateQrDto.user_id },
        subscription: { id: generateQrDto.subscription_id },
        status: SubscriptionStatus.PENDING,
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        user: {
          id: true,
          username: true,
        },
      },
    });
    if (!userSub) {
      throw new NotFoundException('User subscription not found');
    }
    // Tạo mô tả chuyển khoản, ví dụ SUB<subscription_code>
    const encodedDescription = encodeURIComponent(
      `SEVQR${subsription.subscription_code}.${userSub.user.username}`,
    );

    // Khởi tạo query params
    const params = new URLSearchParams({
      acc,
      bank,
      amount: generateQrDto.amount.toString(),
      des: encodedDescription,
      template: generateQrDto.template,
    });

    if (generateQrDto?.download) {
      params.append('download', generateQrDto.download);
    }

    const qrImageUrl = `https://qr.sepay.vn/img?${params.toString()}`;

    return { qrImageUrl };
  }

  async processSePayTransaction(sePayWebhookDto: SePayWebhookDto) {
    const str = sePayWebhookDto.content;
    const regex = /^SEVQR(\d{4})\.(user\d+)$/;
    const match = str.match(regex);
    console.log(match)

    if (match) {
      const subscriptionCode = match[1];
      const username = match[2];

      // Find user subscription
      const userSub = await this.userSubRepository.findOne({
        where: {
          user: { username },
          subscription: { subscription_code: Number(subscriptionCode) },
          status: SubscriptionStatus.PENDING,
        },
        relations: {
          subscription: true,
        },
        select: {
          id: true,
          subscription: {
            id: true,
            duration_months: true,
          },
        },
      });

      if (!userSub) {
        throw new NotFoundException('User subscription not found');
      }

      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(
        startDate.getMonth() + userSub.subscription.duration_months,
      );

      // Update subscription status
      const response = await this.userSubRepository.update(userSub.id, {
        start_date: startDate,
        end_date: endDate,
        status: SubscriptionStatus.ACTIVE,
      });

      // Check if update was successful
      if (response.affected === 0) {
        throw new BadRequestException(
          'Failed to update user subscription status',
        );
      }

      // Optionally log the successful transaction
      // console.log(
      //   `Successfully activated subscription for user ${username} with code ${subscriptionCode}`,
      // );

      return { message: 'Transaction processed successfully' };
    }
    throw new BadRequestException('Invalid transaction content format');
  }
}
